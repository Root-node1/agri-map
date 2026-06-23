from django.contrib import admin
from django.urls import include, path
from drf_spectacular.views import SpectacularAPIView, SpectacularSwaggerView

from . import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/health/', views.health, name='health'),
    path('api/auth/', include('accounts.urls')),
    path('api/farmers/', include('farmers.urls')),
    path('api/fields/', include('fields.urls')),
    path('api/satellite/', include('satellite.urls')),
    path('api/analysis/', include('analysis.urls')),
    path('api/carbon/', include('carbon.urls')),
    path('api/reports/', include('reports.urls')),
    path('api/schema/', SpectacularAPIView.as_view(), name='schema'),
    path('api/docs/', SpectacularSwaggerView.as_view(url_name='schema'), name='swagger-ui'),
]
