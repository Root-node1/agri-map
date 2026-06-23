from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from .models import SoilHealthRecord
from .serializers import SoilHealthResponseSerializer


@extend_schema(
    summary='Get soil health',
    description='Returns soil health data (nitrogen proxy, moisture, degradation risk) for a field',
    tags=['Soil'],
    responses={200: SoilHealthResponseSerializer},
)
class SoilHealthView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        record = SoilHealthRecord.objects.filter(field=field).first()
        if record is None:
            return Response({'error': 'No soil data for this field'}, status=404)

        return Response({
            'field_id': field.id,
            'nitrogen_proxy': record.nitrogen_proxy,
            'moisture_index': record.moisture_index,
            'degradation_risk': record.degradation_risk,
            'recorded_at': record.recorded_at,
        })
