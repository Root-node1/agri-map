from django.db import models


class SoilHealthRecord(models.Model):
    DEGRADATION_CHOICES = [
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('high', 'High'),
        ('severe', 'Severe'),
    ]

    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='soil_records')
    nitrogen_proxy = models.FloatField(null=True, blank=True)
    moisture_index = models.FloatField(null=True, blank=True)
    degradation_risk = models.CharField(max_length=20, choices=DEGRADATION_CHOICES, default='low')
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-recorded_at',)

    def __str__(self):
        return f'Soil {self.field_id} @ {self.recorded_at}'
