from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
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
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        record = CarbonSequestration.objects.filter(field=field).first()
        if record is None:
            return Response({'error': 'No carbon data for this field'}, status=status.HTTP_404_NOT_FOUND)

        return Response({
            'field_id': field.id,
            'carbon_tons': record.carbon_tons,
            'confidence_score': record.confidence_score,
            'methodology': record.methodology,
            'calculated_at': record.calculated_at,
        })


class CarbonCreateSerializer(serializers.Serializer):
    carbon_tons = serializers.FloatField()
    confidence_score = serializers.FloatField()
    methodology = serializers.ChoiceField(choices=['ndvi_based', 'soil_organic_carbon', 'biomass_estimation'])


class CarbonCreateView(APIView):
    def post(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=status.HTTP_404_NOT_FOUND)

        serializer = CarbonCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        record = CarbonSequestration.objects.create(
            field=field,
            **serializer.validated_data,
        )
        return Response({
            'field_id': field.id,
            'carbon_tons': record.carbon_tons,
            'confidence_score': record.confidence_score,
            'methodology': record.methodology,
            'calculated_at': record.calculated_at,
        }, status=status.HTTP_201_CREATED)
