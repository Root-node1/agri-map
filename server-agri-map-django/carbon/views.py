from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from .models import CarbonSequestration
from .serializers import CarbonResponseSerializer


@extend_schema(
    summary='Get carbon sequestration',
    description='Returns estimated carbon sequestration data for a field',
    tags=['Carbon'],
    responses={200: CarbonResponseSerializer},
)
class CarbonDetailView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        record = CarbonSequestration.objects.filter(field=field).first()
        if record is None:
            return Response({'error': 'No carbon data for this field'}, status=404)

        return Response({
            'field_id': field.id,
            'carbon_tons': record.carbon_tons,
            'confidence_score': record.confidence_score,
            'methodology': record.methodology,
            'calculated_at': record.calculated_at,
        })
