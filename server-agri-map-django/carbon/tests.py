from django.contrib.auth import get_user_model
from django.test import TestCase

from carbon.models import CarbonSequestration
from fields.models import Field

User = get_user_model()


class CarbonTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('carbonuser', 'c@e.com', 'pass')
        self.other = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'carbonuser', 'password': 'pass',
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
        CarbonSequestration.objects.create(field=self.field, carbon_tons=2.3, confidence_score=0.87, methodology='ndvi_based')

    def test_carbon_detail(self):
        resp = self.client.get(f'/api/carbon/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('carbon_tons', resp.json())
        self.assertIn('confidence_score', resp.json())
        self.assertIn('methodology', resp.json())

    def test_carbon_not_own_field(self):
        resp = self.client.get(f'/api/carbon/{self.other_field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated(self):
        resp = self.client.get(f'/api/carbon/{self.field.id}/')
        self.assertEqual(resp.status_code, 401)

    def test_create_carbon_record(self):
        resp = self.client.post(f'/api/carbon/{self.field.id}/create/', {
            'carbon_tons': 5.0,
            'confidence_score': 0.9,
            'methodology': 'soil_organic_carbon',
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(CarbonSequestration.objects.count(), 2)
        self.assertAlmostEqual(resp.json()['carbon_tons'], 5.0)

    def test_create_carbon_not_own_field(self):
        resp = self.client.post(f'/api/carbon/{self.other_field.id}/create/', {
            'carbon_tons': 5.0,
            'confidence_score': 0.9,
            'methodology': 'soil_organic_carbon',
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_create_carbon_invalid_data(self):
        resp = self.client.post(f'/api/carbon/{self.field.id}/create/', {
            'carbon_tons': 'not-a-number',
            'confidence_score': 0.9,
            'methodology': 'invalid_methodology',
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)
