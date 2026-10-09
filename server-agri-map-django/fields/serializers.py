from rest_framework import serializers

from .models import Field


class FieldSerializer(serializers.ModelSerializer):
    # Legacy/client aliases: client sends {location, size, cropType} and
    # reads {size, cropType, location} back. Geometry stays required and is
    # the source of truth for area/position.
    size = serializers.FloatField(source='area_ha', required=False, allow_null=True)
    cropType = serializers.CharField(source='crop_type', required=False, allow_blank=True)
    location = serializers.CharField(required=False, allow_blank=True)

    class Meta:
        model = Field
        fields = ('id', 'name', 'geometry', 'area_ha', 'size', 'location',
                  'crop_type', 'cropType', 'centroid_lat', 'centroid_lng',
                  'created_at', 'updated_at')
        read_only_fields = ('user', 'centroid_lat', 'centroid_lng')

    def to_representation(self, instance):
        data = super().to_representation(instance)
        # Keep both spellings populated even for rows created before aliases.
        data.setdefault('size', data.get('area_ha'))
        data.setdefault('cropType', data.get('crop_type'))
        data.setdefault('crop_type', data.get('cropType'))
        return data
