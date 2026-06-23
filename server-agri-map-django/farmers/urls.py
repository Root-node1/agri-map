from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.FarmerRegisterView.as_view(), name='farmer-register'),
    path('me/', views.FarmerMeView.as_view(), name='farmer-me'),
    path('cooperatives/', views.CooperativeListCreateView.as_view(), name='cooperative-list'),
    path('cooperatives/<int:pk>/', views.CooperativeDetailView.as_view(), name='cooperative-detail'),
]
