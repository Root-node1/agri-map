from drf_spectacular.utils import extend_schema
from rest_framework import serializers
from rest_framework.response import Response
from rest_framework.views import APIView

from analysis.models import CropPrediction, VegetationIndex
from carbon.models import CarbonSequestration
from fields.models import Field
from soil.models import SoilHealthRecord

from .models import FieldReport
from .serializers import FieldReportResponseSerializer


@extend_schema(
    summary='Get field report',
    description='Returns an aggregated report combining crop, soil, carbon, and vegetation data for a field',
    tags=['Reports'],
    responses={200: FieldReportResponseSerializer},
)
class FieldReportDetailView(APIView):
    serializer_class = serializers.Serializer
    def get(self, request, field_id=None):
        try:
            field = Field.objects.get(pk=field_id, user=request.user)
        except Field.DoesNotExist:
            return Response({'error': 'Field not found'}, status=404)

        report = FieldReport.objects.filter(field=field).first()
        if report is None:
            crop = CropPrediction.objects.filter(field=field).first()
            soil = SoilHealthRecord.objects.filter(field=field).first()
            carbon = CarbonSequestration.objects.filter(field=field).first()
            indices = VegetationIndex.objects.filter(field=field).first()

            report_data = {
                'field_id': field.id,
                'field_name': field.name,
                'crop': {
                    'type': crop.crop_type if crop else 'Unknown',
                    'confidence': crop.confidence if crop else None,
                } if crop else None,
                'soil': {
                    'nitrogen_proxy': soil.nitrogen_proxy if soil else None,
                    'moisture_index': soil.moisture_index if soil else None,
                    'degradation_risk': soil.degradation_risk if soil else None,
                } if soil else None,
                'carbon': {
                    'carbon_tons': carbon.carbon_tons if carbon else None,
                    'confidence_score': carbon.confidence_score if carbon else None,
                    'methodology': carbon.methodology if carbon else None,
                } if carbon else None,
                'vegetation': {
                    'ndvi': indices.ndvi if indices else None,
                    'evi': indices.evi if indices else None,
                } if indices else None,
            }
            return Response(report_data)

        return Response(report.report_data)
