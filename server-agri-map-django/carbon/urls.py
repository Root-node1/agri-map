from django.urls import path

from . import views

urlpatterns = [
    path('<int:field_id>/', views.CarbonDetailView.as_view(), name='carbon-detail'),
    path('<int:field_id>/create/', views.CarbonCreateView.as_view(), name='carbon-create'),
]
