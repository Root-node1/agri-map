from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase

from analysis.models import (BoundaryDetection, CropPrediction,
                             LandDegradation, VegetationIndex)
from fields.models import Field

User = get_user_model()


class AnalysisTest(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('analyst', 'a@e.com', 'pass')
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        VegetationIndex.objects.create(field=self.field, ndvi=0.72, evi=0.54, date='2026-06-01')
        VegetationIndex.objects.create(field=self.field, ndvi=0.68, evi=0.51, date='2026-05-15')
        CropPrediction.objects.create(field=self.field, crop_type='Maize', confidence=0.92)
        BoundaryDetection.objects.create(field=self.field, boundary_geojson=self.field.geometry)
        LandDegradation.objects.create(field=self.field, severity='low', score=0.22)
        self.client.force_login(self.user)

    def test_vegetation_index(self):
        resp = self.client.get(f'/api/analysis/vegetation/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('indices', resp.json())
        self.assertEqual(len(resp.json()['indices']), 2)

    def test_vegetation_index_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/vegetation/{empty.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['indices'], [])

    def test_vegetation_index_missing_field(self):
        resp = self.client.get('/api/analysis/vegetation/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_crop_type_default(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.field.id}/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())
        self.assertIn('confidence', resp.json())
        self.assertIn('reliability_level', resp.json())

    def test_crop_type_get_compat(self):
        resp = self.client.get(f'/api/analysis/crop-type/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())

    def test_soil_alias_get_compat(self):
        resp = self.client.get(f'/api/analysis/soil/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_crop_type_with_params(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.field.id}/', {
            'humidity': 75, 'rainfall': 120, 'temperature': 28,
            'nitrogen': 50, 'phosphorus': 30, 'potassium': 40,
            'moisture': 40, 'lon': 3.1, 'lat': 43.1,
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())

    def test_crop_type_missing_field(self):
        resp = self.client.post('/api/analysis/crop-type/9999/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_crop_type_invalid_params(self):
        resp = self.client.post(f'/api/analysis/crop-type/{self.field.id}/', {'humidity': -1},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_soil_composition_rejects_oversized_categorical(self):
        resp = self.client.post(f'/api/analysis/soil-composition/{self.field.id}/',
                                {'soil_type': 'x' * 500}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_soil_composition(self):
        resp = self.client.post(f'/api/analysis/soil-composition/{self.field.id}/', {},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_soil_composition_missing_field(self):
        resp = self.client.post('/api/analysis/soil-composition/9999/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_crop_area(self):
        resp = self.client.post(f'/api/analysis/crop-area/{self.field.id}/', {},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_crop_area_missing_field(self):
        resp = self.client.post('/api/analysis/crop-area/9999/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_crop_area_get_compat(self):
        resp = self.client.get(f'/api/analysis/crop-area/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_missing_data_envelope(self):
        empty = Field.objects.create(user=self.user, name='No Data', geometry={'type': 'Point', 'coordinates': [9, 9]})
        resp = self.client.get(f'/api/analysis/degradation/{empty.id}/')
        self.assertEqual(resp.status_code, 404)
        body = resp.json()
        self.assertIn('error', body)
        self.assertIn('message', body)
        self.assertEqual(body.get('code'), 'not_found')

    def test_boundaries(self):
        resp = self.client.get(f'/api/analysis/boundaries/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('boundary', resp.json())

    def test_boundaries_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/boundaries/{empty.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_boundaries_missing_field(self):
        resp = self.client.get('/api/analysis/boundaries/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_trends(self):
        resp = self.client.get(f'/api/analysis/trends/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('trend', resp.json())
        self.assertIn('data_points', resp.json())

    def test_trends_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/trends/{empty.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_trends_missing_field(self):
        resp = self.client.get('/api/analysis/trends/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_trends_declining(self):
        field = Field.objects.create(user=self.user, name='Decline', geometry={'type': 'Point', 'coordinates': [3, 3]})
        VegetationIndex.objects.create(field=field, ndvi=0.8, evi=0.5, date='2026-01-01')
        VegetationIndex.objects.create(field=field, ndvi=0.3, evi=0.2, date='2026-02-01')
        resp = self.client.get(f'/api/analysis/trends/{field.id}/')
        self.assertEqual(resp.json()['trend'], 'declining')

    def test_degradation(self):
        resp = self.client.get(f'/api/analysis/degradation/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('severity', resp.json())

    def test_degradation_empty(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [2, 2]})
        resp = self.client.get(f'/api/analysis/degradation/{empty.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_degradation_missing_field(self):
        resp = self.client.get('/api/analysis/degradation/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_other_user_field_not_visible(self):
        other = User.objects.create_user('stranger', 's@e.com', 'pass')
        field = Field.objects.create(user=other, name='Stranger field',
                                     geometry={'type': 'Point', 'coordinates': [9, 9]})
        resp = self.client.get(f'/api/analysis/vegetation/{field.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_vegetation_requires_login(self):
        self.client.logout()
        resp = self.client.get(f'/api/analysis/vegetation/{self.field.id}/')
        self.assertEqual(resp.status_code, 401)
