from rest_framework import serializers


class SoilHealthResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    nitrogen_proxy = serializers.FloatField(allow_null=True)
    moisture_index = serializers.FloatField(allow_null=True)
    degradation_risk = serializers.CharField()
    recorded_at = serializers.DateTimeField()
