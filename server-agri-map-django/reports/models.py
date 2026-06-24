from django.db import models


class FieldReport(models.Model):
    field = models.ForeignKey('fields.Field', on_delete=models.CASCADE, related_name='reports')
    report_data = models.JSONField()
    generated_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ('-generated_at',)

    def __str__(self):
        return f'Report {self.field_id} @ {self.generated_at}'
