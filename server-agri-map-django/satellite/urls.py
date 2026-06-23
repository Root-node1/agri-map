from django.urls import path

from . import views

urlpatterns = [
    path('fetch/', views.FetchImageryView.as_view(), name='satellite-fetch'),
    path('process/', views.ProcessImageryView.as_view(), name='satellite-process'),
]
