from django.urls import path

from . import views

urlpatterns = [
    path('', views.FieldListCreateView.as_view(), name='field-list'),
    path('<int:pk>/', views.FieldDetailView.as_view(), name='field-detail'),
]
