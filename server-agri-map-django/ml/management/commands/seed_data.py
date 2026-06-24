from django.contrib.auth import get_user_model
from django.core.management.base import BaseCommand

from analysis.models import (BoundaryDetection, CropAreaPrediction,
                             CropPrediction, LandDegradation,
                             SoilPrediction, VegetationIndex)
from carbon.models import CarbonSequestration
from farmers.models import Cooperative, Farmer
from fields.models import Field
from reports.models import FieldReport
from satellite.models import ProcessingJob, SatelliteImage
from soil.models import SoilHealthRecord

User = get_user_model()


class Command(BaseCommand):
    help = 'Creates demo users, fields, and analysis data for development'

    def handle(self, *args, **options):
        self._create_users()
        self._create_farmers()
        self._create_cooperatives()
        self._create_fields()
        self._create_analysis_data()
        self._create_satellite_data()
        self._create_reports()
        self.stdout.write(self.style.SUCCESS('Seed data created successfully'))

    def _create_users(self):
        if not User.objects.filter(username='demo').exists():
            User.objects.create_user('demo', 'demo@example.com', 'demo123')
            self.stdout.write('  Created user: demo')
        if not User.objects.filter(username='farmer1').exists():
            User.objects.create_user('farmer1', 'farmer1@example.com', 'pass123')
            self.stdout.write('  Created user: farmer1')
        if not User.objects.filter(username='farmer2').exists():
            User.objects.create_user('farmer2', 'farmer2@example.com', 'pass123')
            self.stdout.write('  Created user: farmer2')

    def _create_farmers(self):
        for user in User.objects.filter(farmer__isnull=True):
            Farmer.objects.create(user=user, phone='+1234567890', location=f'{user.username}\'s farm')
            self.stdout.write(f'  Created farmer profile: {user.username}')

    def _create_cooperatives(self):
        admin = User.objects.get(username='demo')
        if not Cooperative.objects.filter(name='Green Valley Coop').exists():
            coop = Cooperative.objects.create(
                name='Green Valley Coop',
                description='A cooperative for sustainable farming',
                location='Central Region',
                created_by=admin,
            )
            self.stdout.write(f'  Created cooperative: {coop.name}')
        if not Cooperative.objects.filter(name='Highland Farmers').exists():
            coop = Cooperative.objects.create(
                name='Highland Farmers',
                description='Mountain region farming collective',
                location='Northern Highlands',
                created_by=admin,
            )
            self.stdout.write(f'  Created cooperative: {coop.name}')

    def _create_fields(self):
        for user in User.objects.all():
            if not Field.objects.filter(user=user).exists():
                Field.objects.create(
                    user=user,
                    name=f'{user.username.capitalize()}\'s Field',
                    geometry={'type': 'Polygon', 'coordinates': [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
                    area_ha=10.5,
                )
                Field.objects.create(
                    user=user,
                    name=f'{user.username.capitalize()}\'s Field 2',
                    geometry={'type': 'Polygon', 'coordinates': [[[2, 2], [2, 3], [3, 3], [3, 2], [2, 2]]]},
                    area_ha=5.2,
                )
                self.stdout.write(f'  Created fields for user: {user.username}')

    def _create_analysis_data(self):
        for field in Field.objects.all():
            if not VegetationIndex.objects.filter(field=field).exists():
                VegetationIndex.objects.create(field=field, ndvi=0.72, evi=0.54, date='2026-06-01')
                VegetationIndex.objects.create(field=field, ndvi=0.68, evi=0.51, date='2026-05-15')
                self.stdout.write(f'  Created vegetation indices for field: {field.id}')
            if not CropPrediction.objects.filter(field=field).exists():
                CropPrediction.objects.create(field=field, crop_type='Maize', confidence=0.92)
                self.stdout.write(f'  Created crop prediction for field: {field.id}')
            if not BoundaryDetection.objects.filter(field=field).exists():
                BoundaryDetection.objects.create(field=field, boundary_geojson=field.geometry)
                self.stdout.write(f'  Created boundary detection for field: {field.id}')
            if not LandDegradation.objects.filter(field=field).exists():
                LandDegradation.objects.create(field=field, severity='low', score=0.22)
                self.stdout.write(f'  Created degradation record for field: {field.id}')
            if not SoilPrediction.objects.filter(field=field).exists():
                SoilPrediction.objects.create(field=field, soil_type='Loamy', confidence=0.72)
                self.stdout.write(f'  Created soil prediction for field: {field.id}')
            if not CropAreaPrediction.objects.filter(field=field).exists():
                CropAreaPrediction.objects.create(field=field, crop_type='Maize', confidence=0.81)
                self.stdout.write(f'  Created crop area prediction for field: {field.id}')
            if not SoilHealthRecord.objects.filter(field=field).exists():
                SoilHealthRecord.objects.create(field=field, nitrogen_proxy=0.62, moisture_index=0.48, degradation_risk='moderate')
                self.stdout.write(f'  Created soil health record for field: {field.id}')
            if not CarbonSequestration.objects.filter(field=field).exists():
                CarbonSequestration.objects.create(field=field, carbon_tons=2.3, confidence_score=0.87, methodology='ndvi_based')
                self.stdout.write(f'  Created carbon record for field: {field.id}')

    def _create_satellite_data(self):
        for field in Field.objects.all():
            if not SatelliteImage.objects.filter(field=field).exists():
                SatelliteImage.objects.create(
                    field=field,
                    date='2026-06-01',
                    source_url=f'https://scihub.copernicus.eu/dhus/search?q=field_{field.id}',
                    cloud_cover=12.5,
                    bands={'B02': 0.15, 'B03': 0.22, 'B04': 0.31, 'B08': 0.68},
                )
                self.stdout.write(f'  Created satellite image for field: {field.id}')
            if not ProcessingJob.objects.filter(field=field).exists():
                ProcessingJob.objects.create(
                    field=field,
                    status='completed',
                    result={
                        'cloud_masking': 'applied',
                        'bands_extracted': ['B02', 'B03', 'B04', 'B08'],
                        'ndvi_calculated': 0.72,
                        'evi_calculated': 0.54,
                        'images_processed': 1,
                    },
                )
                self.stdout.write(f'  Created processing job for field: {field.id}')

    def _create_reports(self):
        for field in Field.objects.all():
            if not FieldReport.objects.filter(field=field).exists():
                crop = CropPrediction.objects.filter(field=field).first()
                soil = SoilHealthRecord.objects.filter(field=field).first()
                carbon = CarbonSequestration.objects.filter(field=field).first()
                indices = VegetationIndex.objects.filter(field=field).first()
                FieldReport.objects.create(
                    field=field,
                    report_data={
                        'field': {'id': field.id, 'name': field.name},
                        'crop': {'type': crop.crop_type if crop else 'Unknown', 'confidence': crop.confidence if crop else None} if crop else None,
                        'soil': {'nitrogen_proxy': soil.nitrogen_proxy if soil else None, 'moisture_index': soil.moisture_index if soil else None, 'degradation_risk': soil.degradation_risk if soil else None} if soil else None,
                        'carbon': {'carbon_tons': carbon.carbon_tons if carbon else None, 'confidence_score': carbon.confidence_score if carbon else None, 'methodology': carbon.methodology if carbon else None} if carbon else None,
                        'vegetation': {'ndvi': indices.ndvi if indices else None, 'evi': indices.evi if indices else None} if indices else None,
                    },
                )
                self.stdout.write(f'  Created report for field: {field.id}')
