from django.urls import path

from . import views

urlpatterns = [
    path('', views.FieldListCreateView.as_view(), name='field-list'),
    path('geojson/', views.FieldGeoJSONListView.as_view(), name='field-geojson'),
    path('<int:pk>/', views.FieldDetailView.as_view(), name='field-detail'),
]
