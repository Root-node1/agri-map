from django.urls import path

from . import views

urlpatterns = [
    path('vegetation/<int:field_id>/', views.VegetationIndexView.as_view(), name='vegetation'),
    path('crop-type/<int:field_id>/', views.CropTypeView.as_view(), name='crop-type'),
    path('soil-composition/<int:field_id>/', views.SoilCompositionView.as_view(), name='soil-composition'),
    path('crop-area/<int:field_id>/', views.CropAreaView.as_view(), name='crop-area'),
    path('boundaries/<int:field_id>/', views.BoundaryView.as_view(), name='boundaries'),
    path('trends/<int:field_id>/', views.VegetationTrendsView.as_view(), name='trends'),
    path('degradation/<int:field_id>/', views.DegradationView.as_view(), name='degradation'),
]
