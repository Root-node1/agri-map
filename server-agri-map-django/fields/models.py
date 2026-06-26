from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.db import models

User = get_user_model()

VALID_GEOM_TYPES = {'Point', 'Polygon', 'MultiPolygon', 'LineString', 'MultiLineString', 'MultiPoint', 'GeometryCollection'}


def validate_geojson(value):
    if not isinstance(value, dict):
        raise ValidationError('Geometry must be a GeoJSON object.')
    if 'type' not in value or value['type'] not in VALID_GEOM_TYPES:
        raise ValidationError(f"Invalid GeoJSON type. Must be one of: {', '.join(sorted(VALID_GEOM_TYPES))}")
    if 'coordinates' not in value:
        raise ValidationError('GeoJSON object must contain coordinates.')


class Field(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fields')
    name = models.CharField(max_length=255)
    geometry = models.JSONField(validators=[validate_geojson])
    area_ha = models.FloatField(null=True, blank=True)
    centroid_lat = models.FloatField(null=True, blank=True, editable=False)
    centroid_lng = models.FloatField(null=True, blank=True, editable=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.name

    def save(self, *args, **kwargs):
        if self.geometry:
            lat, lng = self._compute_centroid()
            self.centroid_lat = lat
            self.centroid_lng = lng
        super().save(*args, **kwargs)

    def _compute_centroid(self):
        geom = self.geometry
        t = geom['type']
        c = geom['coordinates']
        if t == 'Point':
            return c[1], c[0]
        if t == 'MultiPoint':
            lngs = [p[0] for p in c]
            lats = [p[1] for p in c]
        elif t == 'LineString':
            lngs = [p[0] for p in c]
            lats = [p[1] for p in c]
        elif t == 'MultiLineString':
            lngs, lats = [], []
            for line in c:
                for p in line:
                    lngs.append(p[0])
                    lats.append(p[1])
        elif t == 'Polygon':
            lngs, lats = [], []
            for ring in c:
                for p in ring:
                    lngs.append(p[0])
                    lats.append(p[1])
        elif t == 'MultiPolygon':
            lngs, lats = [], []
            for poly in c:
                for ring in poly:
                    for p in ring:
                        lngs.append(p[0])
                        lats.append(p[1])
        else:
            return None, None
        if lngs:
            lat = (min(lats) + max(lats)) / 2
            lng = (min(lngs) + max(lngs)) / 2
            return lat, lng
        return None, None
