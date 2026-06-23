from rest_framework import serializers


class CarbonResponseSerializer(serializers.Serializer):
    field_id = serializers.IntegerField()
    carbon_tons = serializers.FloatField()
    confidence_score = serializers.FloatField()
    methodology = serializers.CharField()
    calculated_at = serializers.DateTimeField()
