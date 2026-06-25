from django.db import models


class VegetationIndex(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='vegetation_indices')
    ndvi = models.FloatField(null=True, blank=True)
    evi = models.FloatField(null=True, blank=True)
    date = models.DateField()
    recorded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-date',)

    def __str__(self):
        return f'NDVI {self.ndvi} @ {self.field_id}'


class CropPrediction(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='crop_predictions')
    crop_type = models.CharField(max_length=100)
    confidence = models.FloatField()
    predicted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-predicted_at',)

    def __str__(self):
        return f'{self.crop_type} ({self.confidence})'


class BoundaryDetection(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='boundary_detections')
    boundary_geojson = models.JSONField()
    detected_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'Boundary {self.field_id} @ {self.detected_at}'


class SoilPrediction(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='soil_predictions')
    soil_type = models.CharField(max_length=100)
    confidence = models.FloatField()
    predicted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-predicted_at',)

    def __str__(self):
        return f'{self.soil_type} ({self.confidence})'


class CropAreaPrediction(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='crop_area_predictions')
    crop_type = models.CharField(max_length=100)
    confidence = models.FloatField()
    predicted_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-predicted_at',)

    def __str__(self):
        return f'{self.crop_type} ({self.confidence})'


class LandDegradation(models.Model):
    SEVERITY_CHOICES = [
        ('none', 'No Degradation'),
        ('low', 'Low'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
    ]
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='degradation_records')
    severity = models.CharField(max_length=20, choices=SEVERITY_CHOICES, default='none')
    score = models.FloatField(null=True, blank=True)
    detected_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-detected_at',)

    def __str__(self):
        return f'Degradation {self.severity} @ {self.field_id}'
