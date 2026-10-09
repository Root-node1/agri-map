from datetime import date

from django.urls import reverse
from drf_spectacular.utils import extend_schema
from rest_framework import generics, serializers, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from server_agri_map_django.caching import bump_user_viewcache
from server_agri_map_django.http import CanonicalLocationMixin
from server_agri_map_django.permissions import owned_or_shared_field_or_404
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


class SatelliteImageListCreateView(CanonicalLocationMixin, generics.ListCreateAPIView):
    serializer_class = SatelliteImageSerializer
    location_route = 'satellite-image-detail'
    filterset_fields = ('field', 'date')
    ordering_fields = ('date', 'ingested_at', 'cloud_cover')
    ordering = ('-date',)

    def get_queryset(self):
        return SatelliteImage.objects.filter(field__user=self.request.user).select_related('field')


class SatelliteImageDetailView(generics.RetrieveDestroyAPIView):
    serializer_class = SatelliteImageSerializer

    def get_queryset(self):
        return SatelliteImage.objects.filter(field__user=self.request.user).select_related('field')


class ProcessingJobListView(generics.ListAPIView):
    serializer_class = ProcessingJobSerializer
    filterset_fields = ('field', 'status')
    ordering_fields = ('created_at', 'completed_at')
    ordering = ('-created_at',)

    def get_queryset(self):
        return ProcessingJob.objects.filter(field__user=self.request.user).select_related('field')


class ProcessingJobDetailView(generics.RetrieveAPIView):
    serializer_class = ProcessingJobSerializer

    def get_queryset(self):
        return ProcessingJob.objects.filter(field__user=self.request.user).select_related('field')


@extend_schema(
    summary='Fetch satellite imagery',
    description='Fetches satellite imagery for a field from Sentinel-2 (stub — returns simulated data)',
    tags=['Satellite'],
    request=FetchImageryInputSerializer,
    responses={201: FetchImageryResponseSerializer},
)
class FetchImageryView(APIView):
    serializer_class = serializers.Serializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'satellite'

    def post(self, request):
        serializer = FetchImageryInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        field_id = serializer.validated_data['field_id']
        date_range = serializer.validated_data.get('date_range', [])

        field = owned_or_shared_field_or_404(request.user, field_id)

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
            'source': data.get('source', 'unknown'),
        }, status=status.HTTP_201_CREATED, headers={
            'Location': reverse('satellite-image-detail', kwargs={'pk': image.id}),
        })


@extend_schema(
    summary='Process satellite imagery',
    description='Processes fetched satellite imagery (NDVI calculation, cloud masking). Note: current implementation uses simulated processing results.',
    tags=['Satellite'],
    request=ProcessImageryInputSerializer,
    responses={200: ProcessImageryResponseSerializer},
)
class ProcessImageryView(APIView):
    serializer_class = serializers.Serializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'satellite'

    def post(self, request):
        serializer = ProcessImageryInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        field_id = serializer.validated_data['field_id']

        field = owned_or_shared_field_or_404(request.user, field_id)

        try:
            result = services.process_field_images(field=field)
        except ValueError as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

        bump_user_viewcache(request.user)

        return Response(result)
