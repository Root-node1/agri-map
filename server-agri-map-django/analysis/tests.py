from django.contrib.auth import get_user_model
from django.test import TestCase

from analysis.models import (BoundaryDetection, CropPrediction,
                             LandDegradation, VegetationIndex)
from fields.models import Field

User = get_user_model()


class AnalysisTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('analyst', 'a@e.com', 'pass')
        self.other = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'analyst', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        self.other_field = Field.objects.create(
            user=self.other, name='Other Field',
            geometry={'type': 'Point', 'coordinates': [1, 1]},
        )
        # Seed analysis data for endpoints that no longer create on GET
        VegetationIndex.objects.create(field=self.field, ndvi=0.72, evi=0.54, date='2026-06-01')
        VegetationIndex.objects.create(field=self.field, ndvi=0.68, evi=0.51, date='2026-05-15')
        CropPrediction.objects.create(field=self.field, crop_type='Maize', confidence=0.92)
        BoundaryDetection.objects.create(field=self.field, boundary_geojson=self.field.geometry)
        LandDegradation.objects.create(field=self.field, severity='low', score=0.22)

    def test_vegetation_index(self):
        resp = self.client.get(f'/api/analysis/vegetation/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('indices', resp.json())

    def test_vegetation_index_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/vegetation/{empty.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['indices'], [])

    def test_vegetation_index_not_own_field(self):
        resp = self.client.get(f'/api/analysis/vegetation/{self.other_field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_crop_type_default(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.field.id}/', {}, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())
        self.assertIn('confidence', resp.json())
        self.assertIn('reliability_level', resp.json())

    def test_crop_type_with_params(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.field.id}/', {
            'humidity': 75, 'rainfall': 120, 'temperature': 28,
            'nitrogen': 50, 'phosphorus': 30, 'potassium': 40,
            'moisture': 40, 'lon': 3.1, 'lat': 43.1,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())

    def test_crop_type_not_own_field(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.other_field.id}/', {}, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_crop_type_invalid_params(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.field.id}/', {'humidity': -1}, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_boundaries(self):
        resp = self.client.get(f'/api/analysis/boundaries/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('boundary', resp.json())

    def test_boundaries_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/boundaries/{empty.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_trends(self):
        resp = self.client.get(f'/api/analysis/trends/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('trend', resp.json())
        self.assertIn('data_points', resp.json())

    def test_trends_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/trends/{empty.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_degradation(self):
        resp = self.client.get(f'/api/analysis/degradation/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('severity', resp.json())

    def test_degradation_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/degradation/{empty.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated(self):
        resp = self.client.get(f'/api/analysis/vegetation/{self.field.id}/')
        self.assertEqual(resp.status_code, 401)
