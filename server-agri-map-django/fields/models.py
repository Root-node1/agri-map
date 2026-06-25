from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Field(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fields')
    name = models.CharField(max_length=255)
    geometry = models.JSONField()
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
        lngs, lats = [], []
        if t == 'Polygon':
            for ring in c:
                for p in ring:
                    lngs.append(p[0])
                    lats.append(p[1])
        elif t == 'MultiPolygon':
            for poly in c:
                for ring in poly:
                    for p in ring:
                        lngs.append(p[0])
                        lats.append(p[1])
        if lngs:
            lat = (min(lats) + max(lats)) / 2
            lng = (min(lngs) + max(lngs)) / 2
            return lat, lng
        return None, None
