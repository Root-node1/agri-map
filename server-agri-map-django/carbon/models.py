from django.db import models


class CarbonSequestration(models.Model):
    METHODOLOGY_CHOICES = [
        ('ndvi_based', 'NDVI-based estimation'),
        ('soil_organic_carbon', 'Soil Organic Carbon'),
        ('biomass_estimation', 'Biomass Estimation'),
    ]

    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='carbon_records')
    carbon_tons = models.FloatField()
    confidence_score = models.FloatField()
    methodology = models.CharField(max_length=50, choices=METHODOLOGY_CHOICES, default='ndvi_based')
    calculated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-calculated_at',)

    def __str__(self):
        return f'{self.carbon_tons}t CO2 @ {self.field_id}'
