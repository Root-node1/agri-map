from django.urls import path

from . import views

urlpatterns = [
    path('register/', views.RegisterView.as_view(), name='register'),
    path('me/', views.MeView.as_view(), name='me'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('refresh/', views.RefreshTokenView.as_view(), name='refresh'),
]
