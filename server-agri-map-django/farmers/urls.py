from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.FarmerRegisterView.as_view(), name='farmer-register'),
    path('me/', views.FarmerMeView.as_view(), name='farmer-me'),
    path('cooperatives/', views.CooperativeListCreateView.as_view(), name='cooperative-list'),
    path('cooperatives/<int:pk>/', views.CooperativeDetailView.as_view(), name='cooperative-detail'),
    path('cooperatives/<int:pk>/members/', views.CooperativeMemberListCreateView.as_view(), name='cooperative-member-list'),
    path('cooperatives/<int:pk>/members/<int:member_pk>/', views.CooperativeMemberDetailView.as_view(), name='cooperative-member-detail'),
]
