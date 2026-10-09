from django.urls import path

from . import views

urlpatterns = [
    path('stats/', views.CarbonStatsView.as_view(), name='carbon-stats'),
    path('', views.CarbonListView.as_view(), name='carbon-list'),
    path('<int:field_id>/', views.CarbonDetailView.as_view(), name='carbon-detail'),
    path('<int:field_id>/create/', views.CarbonCreateView.as_view(), name='carbon-create'),
]
