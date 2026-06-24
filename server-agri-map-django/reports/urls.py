from django.urls import path

from . import views

urlpatterns = [
    path('field/<int:field_id>/', views.FieldReportDetailView.as_view(), name='report-field'),
]
