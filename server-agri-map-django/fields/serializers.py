from rest_framework import serializers

from .models import Field


class FieldSerializer(serializers.ModelSerializer):
    class Meta:
        model = Field
        fields = ('id', 'name', 'geometry', 'area_ha', 'centroid_lat', 'centroid_lng',
                  'created_at', 'updated_at')
        read_only_fields = ('user', 'centroid_lat', 'centroid_lng')
