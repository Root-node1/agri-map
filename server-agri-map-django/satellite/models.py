from django.db import models


class SatelliteImage(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='satellite_images')
    date = models.DateField()
    source_url = models.URLField(blank=True)
    cloud_cover = models.FloatField(null=True, blank=True)
    bands = models.JSONField(null=True, blank=True)
    ingested_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-date',)

    def __str__(self):
        return f'Sentinel-2 {self.field_id} @ {self.date}'


class ProcessingJob(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('processing', 'Processing'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
    ]

    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='processing_jobs')
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    result = models.JSONField(null=True, blank=True)
    error = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    completed_at = models.DateTimeField(null=True, blank=True)

    class Meta:
        ordering = ('-created_at',)

    def __str__(self):
        return f'Job {self.id} ({self.status})'
