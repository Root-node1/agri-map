import logging

from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from ml.services import predict_crop

from .models import BoundaryDetection, LandDegradation, VegetationIndex
from .serializers import (
    BoundaryResponseSerializer,
    CropTypeInputSerializer,
    CropTypeResponseSerializer,
    DegradationResponseSerializer,
    VegetationIndexResponseSerializer,
    VegetationTrendsResponseSerializer,
)

logger = logging.getLogger(__name__)


@extend_schema(
    summary='Get vegetation indices',
    description='Returns NDVI and EVI values for a field',
    tags=['Analysis'],
    responses={200: VegetationIndexResponseSerializer},
)
class VegetationIndexView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        indices = VegetationIndex.objects.filter(field=field)[:10]

        return Response({
            'field_id': field.id,
            'indices': [
                {'ndvi': i.ndvi, 'evi': i.evi, 'date': i.date}
                for i in indices
            ],
        })


@extend_schema(
    summary='Predict crop type',
    description='Predicts the most suitable crop for a field using ML (Confidence Gating applied)',
    tags=['Analysis'],
    request=CropTypeInputSerializer,
    responses={200: CropTypeResponseSerializer},
)
class CropTypeView(APIView):
    serializer_class = CropTypeInputSerializer
    def post(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CropTypeInputSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = predict_crop(field_id=field.id, user=request.user, **serializer.validated_data)

        logger.info(
            'CropTypeView — field=%s crop=%s confidence=%.4f',
            field_id, result['crop_type'], result['confidence'],
        )

        return Response({
            'field_id': field.id,
            'crop_type': result['crop_type'],
            'confidence': result['confidence'],
            'reliability_level': result['reliability_level'],
            'message': result['message'],
        })


@extend_schema(
    summary='Get field boundaries',
    description='Returns detected boundaries for a field',
    tags=['Analysis'],
    responses={200: BoundaryResponseSerializer},
)
class BoundaryView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        detection = BoundaryDetection.objects.filter(field=field).first()
        if detection is None:
            return Response({'error': 'No boundary data for this field'}, status=404)

        return Response({
            'field_id': field.id,
            'boundary': detection.boundary_geojson,
            'detected_at': detection.detected_at,
        })


@extend_schema(
    summary='Get vegetation trends',
    description='Returns NDVI/EVI time-series trend data for a field',
    tags=['Analysis'],
    responses={200: VegetationTrendsResponseSerializer},
)
class VegetationTrendsView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        indices = VegetationIndex.objects.filter(field=field).order_by('date')
        if not indices.exists():
            return Response({'error': 'No vegetation data for this field'}, status=404)

        trend = 'declining' if indices.count() >= 2 and indices.last().ndvi < indices.first().ndvi else 'stable'

        return Response({
            'field_id': field.id,
            'trend': trend,
            'data_points': [
                {'date': i.date, 'ndvi': i.ndvi, 'evi': i.evi}
                for i in indices
            ],
        })


@extend_schema(
    summary='Get land degradation',
    description='Returns land degradation severity assessment for a field',
    tags=['Analysis'],
    responses={200: DegradationResponseSerializer},
)
class DegradationView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        record = LandDegradation.objects.filter(field=field).first()
        if record is None:
            return Response({'error': 'No degradation data for this field'}, status=404)

        return Response({
            'field_id': field.id,
            'severity': record.severity,
            'score': record.score,
            'detected_at': record.detected_at,
        })
