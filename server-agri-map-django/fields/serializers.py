from rest_framework import serializers

from .models import Field


class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = ('id', 'name', 'geometry', 'area_ha', 'created_at', 'updated_at')
        read_only_fields = ('user',)
