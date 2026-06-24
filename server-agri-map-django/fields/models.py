from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Field(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='fields')
    name = models.CharField(max_length=255)
    geometry = models.JSONField()
    area_ha = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return self.name
