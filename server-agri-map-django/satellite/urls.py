from django.urls import path

from . import views

urlpatterns = [
    path('fetch/', views.FetchImageryView.as_view(), name='satellite-fetch'),
    path('process/', views.ProcessImageryView.as_view(), name='satellite-process'),
    path('images/', views.SatelliteImageListCreateView.as_view(), name='satellite-image-list'),
    path('images/<int:pk>/', views.SatelliteImageDetailView.as_view(), name='satellite-image-detail'),
    path('jobs/', views.ProcessingJobListView.as_view(), name='satellite-job-list'),
    path('jobs/<int:pk>/', views.ProcessingJobDetailView.as_view(), name='satellite-job-detail'),
]
