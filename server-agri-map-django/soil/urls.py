from django.urls import path

from . import views

urlpatterns = [
    path('<int:field_id>/', views.SoilHealthView.as_view(), name='soil-health'),
]
