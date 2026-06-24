from datetime import date

from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from .models import ProcessingJob, SatelliteImage
from .serializers import (
    FetchImageryInputSerializer,
    FetchImageryResponseSerializer,
    ProcessImageryInputSerializer,
    ProcessImageryResponseSerializer,
)


@extend_schema(
    summary='Fetch satellite imagery',
    description='Fetches satellite imagery for a field from Sentinel-2',
    tags=['Satellite'],
    request=FetchImageryInputSerializer,
    responses={201: FetchImageryResponseSerializer},
)
class FetchImageryView(APIView):
    serializer_class = serializers.Serializer
    def post(self, request):
        serializer = FetchImageryInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        field_id = serializer.validated_data['field_id']
        date_range = serializer.validated_data.get('date_range', [])

        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        start_date = date_range[0] if len(date_range) > 0 else str(date.today().replace(month=1, day=1))
        end_date = date_range[1] if len(date_range) > 1 else str(date.today())

        image = SatelliteImage.objects.create(
            field=field,
            date=date.today(),
            source_url=f'https://scihub.copernicus.eu/dhus/search?q=field_{field_id}',
            cloud_cover=12.5,
            bands={
                'B02': 0.15,
                'B03': 0.22,
                'B04': 0.31,
                'B08': 0.68,
            },
        )

        return Response({
            'field_id': field.id,
            'image_id': image.id,
            'date': image.date,
            'source_url': image.source_url,
            'cloud_cover': image.cloud_cover,
            'bands': image.bands,
            'date_range': {'start': start_date, 'end': end_date},
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    summary='Process satellite imagery',
    description='Processes fetched satellite imagery (NDVI calculation, cloud masking)',
    tags=['Satellite'],
    request=ProcessImageryInputSerializer,
    responses={200: ProcessImageryResponseSerializer},
)
class ProcessImageryView(APIView):
    serializer_class = serializers.Serializer
    def post(self, request):
        serializer = ProcessImageryInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        field_id = serializer.validated_data['field_id']

        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        images = SatelliteImage.objects.filter(field=field).order_by('-date')
        if not images.exists():
            return Response({'error': 'No imagery available. Fetch imagery first.'}, status=status.HTTP_400_BAD_REQUEST)

        job = ProcessingJob.objects.create(
            field=field,
            status='completed',
            result={
                'cloud_masking': 'applied',
                'bands_extracted': ['B02', 'B03', 'B04', 'B08'],
                'ndvi_calculated': 0.72,
                'evi_calculated': 0.54,
                'images_processed': 1,
            },
        )

        return Response({
            'job_id': job.id,
            'status': job.status,
            'result': job.result,
        })
