from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase

from carbon.models import CarbonSequestration
from fields.models import Field

User = get_user_model()


class CarbonTest(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('carbonuser', 'c@e.com', 'pass')
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        CarbonSequestration.objects.create(field=self.field, carbon_tons=2.3, confidence_score=0.87, methodology='ndvi_based')
        self.client.force_login(self.user)

    def test_carbon_detail_open(self):
        resp = self.client.get(f'/api/carbon/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('carbon_tons', resp.json())
        self.assertIn('confidence_score', resp.json())
        self.assertIn('methodology', resp.json())

    def test_carbon_detail_no_data(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get(f'/api/carbon/{empty.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_carbon_detail_missing_field(self):
        resp = self.client.get('/api/carbon/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_create_carbon_record(self):
        resp = self.client.post(f'/api/carbon/{self.field.id}/create/', {
            'carbon_tons': 5.0,
            'confidence_score': 0.9,
            'methodology': 'soil_organic_carbon',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(CarbonSequestration.objects.count(), 2)
        self.assertAlmostEqual(resp.json()['carbon_tons'], 5.0)

    def test_create_carbon_missing_field(self):
        resp = self.client.post('/api/carbon/9999/create/', {
            'carbon_tons': 5.0,
            'confidence_score': 0.9,
            'methodology': 'soil_organic_carbon',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_create_carbon_invalid_data(self):
        resp = self.client.post(f'/api/carbon/{self.field.id}/create/', {
            'carbon_tons': 'not-a-number',
            'confidence_score': 0.9,
            'methodology': 'invalid_methodology',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_create_carbon_missing_fields(self):
        resp = self.client.post(f'/api/carbon/{self.field.id}/create/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_carbon_stats(self):
        resp = self.client.get('/api/carbon/stats/')
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        self.assertAlmostEqual(body['total'], 2.3)
        self.assertAlmostEqual(body['totalCredits'], 2.3)

    def test_carbon_list(self):
        resp = self.client.get('/api/carbon/')
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        credits = body.get('credits', body.get('results', []))
        self.assertEqual(len(credits), 1)
        self.assertEqual(credits[0]['field_id'], self.field.id)
