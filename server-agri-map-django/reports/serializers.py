from rest_framework import serializers


class _CropInfoSerializer(serializers.Serializer):
    type = serializers.CharField(allow_null=True)
    confidence = serializers.FloatField(allow_null=True)


class _SoilInfoSerializer(serializers.Serializer):
    nitrogen_proxy = serializers.FloatField(allow_null=True)
    moisture_index = serializers.FloatField(allow_null=True)
    degradation_risk = serializers.CharField(allow_null=True)


class _CarbonInfoSerializer(serializers.Serializer):
    carbon_tons = serializers.FloatField(allow_null=True)
    confidence_score = serializers.FloatField(allow_null=True)
    methodology = serializers.CharField(allow_null=True)


class _VegetationInfoSerializer(serializers.Serializer):
    ndvi = serializers.FloatField(allow_null=True)
    evi = serializers.FloatField(allow_null=True)


class FieldReportResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    field_name = serializers.CharField()
    crop = _CropInfoSerializer(allow_null=True)
    soil = _SoilInfoSerializer(allow_null=True)
    carbon = _CarbonInfoSerializer(allow_null=True)
    vegetation = _VegetationInfoSerializer(allow_null=True)
