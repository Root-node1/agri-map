from rest_framework import serializers


class CropTypeInputSerializer(serializers.Serializer):
    nitrogen = serializers.FloatField(min_value=0, max_value=300, default=80)
    phosphorus = serializers.FloatField(min_value=0, max_value=300, default=40)
    potassium = serializers.FloatField(min_value=0, max_value=300, default=40)
    temperature = serializers.FloatField(min_value=-10, max_value=55, default=25.0)
    humidity = serializers.FloatField(min_value=0, max_value=100, default=70.0)
    rainfall = serializers.FloatField(min_value=0, max_value=5000, default=200.0)
    moisture = serializers.FloatField(min_value=0, max_value=100, default=40.0)
    lon = serializers.FloatField(min_value=-180, max_value=180, default=3.1)
    lat = serializers.FloatField(min_value=-90, max_value=90, default=43.1)


class _VegetationDataSerializer(serializers.Serializer):
    ndvi = serializers.FloatField()
    evi = serializers.FloatField()
    date = serializers.DateField()


class VegetationIndexResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    indices = _VegetationDataSerializer(many=True)


class CropTypeResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    crop_type = serializers.CharField()
    confidence = serializers.FloatField()
    reliability_level = serializers.CharField()
    message = serializers.CharField()


class BoundaryResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    boundary = serializers.DictField()
    detected_at = serializers.DateTimeField()


class _TrendDataPointSerializer(serializers.Serializer):
    date = serializers.DateField()
    ndvi = serializers.FloatField()
    evi = serializers.FloatField()


class VegetationTrendsResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    trend = serializers.CharField()
    data_points = _TrendDataPointSerializer(many=True)


class DegradationResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    severity = serializers.CharField()
    score = serializers.FloatField(allow_null=True)
    detected_at = serializers.DateTimeField()
