from django.contrib import admin

from .models import (
    BoundaryDetection, CropAreaPrediction, CropPrediction,
    LandDegradation, SoilPrediction, VegetationIndex,
)

admin.site.register(VegetationIndex)
admin.site.register(CropPrediction)
admin.site.register(BoundaryDetection)
admin.site.register(SoilPrediction)
admin.site.register(CropAreaPrediction)
admin.site.register(LandDegradation)
