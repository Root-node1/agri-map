from django.contrib import admin

from .models import ProcessingJob, SatelliteImage

admin.site.register(SatelliteImage)
admin.site.register(ProcessingJob)
