import logging

from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView

from ml.services import predict_crop, predict_crop_area, predict_soil
from server_agri_map_django.caching import bump_user_viewcache, cached_get_view
from server_agri_map_django.permissions import owned_or_shared_field_or_404

from .models import BoundaryDetection, LandDegradation, VegetationIndex
from .serializers import (
    BoundaryResponseSerializer,
    CropTypeInputSerializer,
    CropTypeResponseSerializer,
    DegradationResponseSerializer,
    MLInputSerializer,
    MLResponseSerializer,
    VegetationIndexResponseSerializer,
    VegetationTrendsResponseSerializer,
)

logger = logging.getLogger(__name__)


def not_found(message: str) -> dict:
    """Missing-data body matching the global error envelope
    ({error, message, code, details}) for direct 404 Responses."""
    return {'error': message, 'message': message, 'code': 'not_found', 'details': {}}


@extend_schema(
    summary='Get vegetation indices',
    description='Returns NDVI and EVI values for a field',
    tags=['Analysis'],
    responses={200: VegetationIndexResponseSerializer},
)
class VegetationIndexView(APIView):
    serializer_class = serializers.Serializer

    @cached_get_view()
    def get(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)

        # Bounded limit/offset instead of a hardcoded slice.
        try:
            limit = int(request.query_params.get('limit', 10))
        except (TypeError, ValueError):
            limit = 10
        limit = max(1, min(limit, 100))
        try:
            offset = int(request.query_params.get('offset', 0))
        except (TypeError, ValueError):
            offset = 0
        offset = max(0, offset)

        qs = VegetationIndex.objects.filter(field=field).order_by('-date')
        total = qs.count()
        indices = qs[offset:offset + limit]

        return Response({
            'field_id': field.id,
            'count': total,
            'limit': limit,
            'offset': offset,
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
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ml'

    def _predict(self, field, data):
        serializer = CropTypeInputSerializer(data=data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = predict_crop(field_id=field.id, **serializer.validated_data)
        bump_user_viewcache(self.request.user)

        logger.info(
            'CropTypeView — field=%s crop=%s confidence=%.4f reliability=%s source=%s',
            field.id, result.get('crop_type'), result.get('confidence'),
            result.get('reliability_level'), result.get('source'),
        )

        return Response({
            'field_id': field.id,
            'crop_type': result.get('crop_type', result.get('prediction')),
            'crop': result.get('crop_type', result.get('prediction')),
            'confidence': result['confidence'],
            'reliability_level': result['reliability_level'],
            'message': result['message'],
            'source': result.get('source', 'unknown'),
            'action_required': result['reliability_level'] == 'Low',
        })

    def post(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)
        return self._predict(field, request.data)

    def get(self, request, field_id=None):
        # Compatibility: client getCropType() issues GET. All inputs have
        # defaults, so predict with defaults + query-param overrides.
        field = owned_or_shared_field_or_404(request.user, field_id)
        return self._predict(field, dict(request.query_params))


@extend_schema(
    summary='Predict soil composition',
    description='Predicts soil type (Clayey, Loamy, Sandy) for a field',
    tags=['Analysis'],
    request=MLInputSerializer,
    responses={200: MLResponseSerializer},
)
class SoilCompositionView(APIView):
    serializer_class = MLInputSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ml'

    def _predict(self, field, data):
        serializer = MLInputSerializer(data=data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = predict_soil(field_id=field.id, **serializer.validated_data)
        bump_user_viewcache(self.request.user)

        return Response({
            'field_id': field.id,
            'prediction': result.get('prediction'),
            'confidence': result['confidence'],
            'reliability_level': result['reliability_level'],
            'message': result.get('note', result['message']),
            'source': result.get('source', 'unknown'),
            'action_required': result['reliability_level'] == 'Low',
        })

    def post(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)
        return self._predict(field, request.data)

    def get(self, request, field_id=None):
        # Compatibility: client getSoil() issues GET /soil/... and
        # analysis getSoil() issues GET. Predict with defaults + overrides.
        field = owned_or_shared_field_or_404(request.user, field_id)
        return self._predict(field, dict(request.query_params))


@extend_schema(
    summary='Identify crop in field',
    description='Identifies the crop type currently growing in a field using ML',
    tags=['Analysis'],
    request=MLInputSerializer,
    responses={200: MLResponseSerializer},
)
class CropAreaView(APIView):
    serializer_class = MLInputSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'ml'

    def _predict(self, field, data):
        serializer = MLInputSerializer(data=data)
        if not serializer.is_valid():
            return Response({'error': 'Invalid input', 'details': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        result = predict_crop_area(field_id=field.id, **serializer.validated_data)
        bump_user_viewcache(self.request.user)

        logger.info(
            'CropAreaView — field=%s crop=%s confidence=%.4f reliability=%s source=%s',
            field.id, result.get('crop_type'), result.get('confidence'),
            result.get('reliability_level'), result.get('source'),
        )

        return Response({
            'field_id': field.id,
            'prediction': result.get('crop_type', result.get('prediction')),
            'confidence': result['confidence'],
            'reliability_level': result['reliability_level'],
            'message': result['message'],
            'source': result.get('source', 'unknown'),
            'action_required': result['reliability_level'] == 'Low',
        })

    def post(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)
        return self._predict(field, request.data)

    def get(self, request, field_id=None):
        # Same GET compatibility as crop-type/soil: predict with defaults
        # + query-param overrides so simple reads work without a POST body.
        field = owned_or_shared_field_or_404(request.user, field_id)
        return self._predict(field, dict(request.query_params))


@extend_schema(
    summary='Get field boundaries',
    description='Returns detected boundaries for a field',
    tags=['Analysis'],
    responses={200: BoundaryResponseSerializer},
)
class BoundaryView(APIView):
    serializer_class = serializers.Serializer
    @cached_get_view()
    def get(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)

        detection = BoundaryDetection.objects.filter(field=field).first()
        if detection is None:
            return Response(not_found('No boundary data for this field'), status=404)

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
    @cached_get_view()
    def get(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)

        indices = VegetationIndex.objects.filter(field=field).order_by('date')
        if not indices.exists():
            return Response(not_found('No vegetation data for this field'), status=404)

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
    @cached_get_view()
    def get(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)

        record = LandDegradation.objects.filter(field=field).first()
        if record is None:
            return Response(not_found('No degradation data for this field'), status=404)

        return Response({
            'field_id': field.id,
            'severity': record.severity,
            'score': record.score,
            'detected_at': record.detected_at,
        })
