from datetime import date

from drf_spectacular.utils import extend_schema
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from . import services
from .models import ProcessingJob, SatelliteImage
from .serializers import (
    FetchImageryInputSerializer,
    FetchImageryResponseSerializer,
    ProcessImageryInputSerializer,
    ProcessImageryResponseSerializer,
    ProcessingJobSerializer,
    SatelliteImageSerializer,
)


class SatelliteImageListCreateView(generics.ListCreateAPIView):
    serializer_class = SatelliteImageSerializer

    def get_queryset(self):
        return SatelliteImage.objects.filter(field__user=self.request.user)


class SatelliteImageDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = SatelliteImageSerializer

    def get_queryset(self):
        return SatelliteImage.objects.filter(field__user=self.request.user)


class ProcessingJobListView(generics.ListAPIView):
    serializer_class = ProcessingJobSerializer

    def get_queryset(self):
        return ProcessingJob.objects.filter(field__user=self.request.user)


class ProcessingJobDetailView(generics.RetrieveAPIView):
    serializer_class = ProcessingJobSerializer

    def get_queryset(self):
        return ProcessingJob.objects.filter(field__user=self.request.user)


@extend_schema(
    summary='Fetch satellite imagery',
    description='Fetches satellite imagery for a field from Sentinel-2 (stub — returns simulated data)',
    tags=['Satellite'],
    request=FetchImageryInputSerializer,
    responses={201: FetchImageryResponseSerializer},
)
class FetchImageryView(APIView):
    serializer_class = serializers.Serializer
    def post(self, request):
        serializer = FetchImageryInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        field_id = serializer.validated_data['field_id']
        date_range = serializer.validated_data.get('date_range', [])

        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        start_date = date_range[0] if len(date_range) > 0 else str(date.today().replace(month=1, day=1))
        end_date = date_range[1] if len(date_range) > 1 else str(date.today())

        data = services.fetch_satellite_data(field=field, start_date=start_date, end_date=end_date)

        image = SatelliteImage.objects.create(
            field=field,
            date=data['date'],
            source_url=data['source_url'],
            cloud_cover=data.get('cloud_cover'),
            bands=data['bands'],
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
    description='Processes fetched satellite imagery (NDVI calculation, cloud masking). Note: current implementation uses simulated processing results.',
    tags=['Satellite'],
    request=ProcessImageryInputSerializer,
    responses={200: ProcessImageryResponseSerializer},
)
class ProcessImageryView(APIView):
    serializer_class = serializers.Serializer
    def post(self, request):
        serializer = ProcessImageryInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        field_id = serializer.validated_data['field_id']

        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        try:
            result = services.process_field_images(field=field)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        return Response(result)
