from rest_framework import serializers

from ml.schema import INPUT_RANGES, MAX_CATEGORICAL_LENGTH


def _ranged_float(name, default):
    lo, hi = INPUT_RANGES[name]
    return serializers.FloatField(min_value=lo, max_value=hi, default=default)


class CropTypeInputSerializer(serializers.Serializer):
    nitrogen = _ranged_float('nitrogen', 80)
    phosphorus = _ranged_float('phosphorus', 40)
    potassium = _ranged_float('potassium', 40)
    temperature = _ranged_float('temperature', 25.0)
    humidity = _ranged_float('humidity', 70.0)
    rainfall = _ranged_float('rainfall', 200.0)
    moisture = _ranged_float('moisture', 40.0)
    lon = _ranged_float('lon', 3.1)
    lat = _ranged_float('lat', 43.1)


class _VegetationDataSerializer(serializers.Serializer):
    ndvi = serializers.FloatField()
    evi = serializers.FloatField()
    date = serializers.DateField()


class VegetationIndexResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    count = serializers.IntegerField()
    limit = serializers.IntegerField()
    offset = serializers.IntegerField()
    indices = _VegetationDataSerializer(many=True)


class CropTypeResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    crop_type = serializers.CharField()
    confidence = serializers.FloatField()
    reliability_level = serializers.CharField()
    message = serializers.CharField()
    source = serializers.CharField()
    action_required = serializers.BooleanField()


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


class MLInputSerializer(serializers.Serializer):
    nitrogen = _ranged_float('nitrogen', 80)
    phosphorus = _ranged_float('phosphorus', 40)
    potassium = _ranged_float('potassium', 40)
    temperature = _ranged_float('temperature', 25.0)
    humidity = _ranged_float('humidity', 70.0)
    rainfall = _ranged_float('rainfall', 200.0)
    moisture = _ranged_float('moisture', 40.0)
    lon = _ranged_float('lon', 3.1)
    lat = _ranged_float('lat', 43.1)
    soil_type = serializers.CharField(required=False, default='Unknown', max_length=MAX_CATEGORICAL_LENGTH)
    region = serializers.CharField(required=False, default='Unknown', max_length=MAX_CATEGORICAL_LENGTH)
    country = serializers.CharField(required=False, default='Unknown', max_length=MAX_CATEGORICAL_LENGTH)


class MLResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField(allow_null=True)
    prediction = serializers.CharField()
    confidence = serializers.FloatField()
    reliability_level = serializers.CharField()
    message = serializers.CharField()
    source = serializers.CharField()
    action_required = serializers.BooleanField()
