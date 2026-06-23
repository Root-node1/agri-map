from django.contrib.auth import get_user_model
from django.test import TestCase

from fields.models import Field
from soil.models import SoilHealthRecord

User = get_user_model()


class SoilTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('soiluser', 's@e.com', 'pass')
        self.other = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'soiluser', 'password': 'pass',
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
        SoilHealthRecord.objects.create(field=self.field, nitrogen_proxy=0.62, moisture_index=0.48, degradation_risk='moderate')

    def test_soil_health(self):
        resp = self.client.get(f'/api/analysis/soil/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('nitrogen_proxy', resp.json())
        self.assertIn('moisture_index', resp.json())
        self.assertIn('degradation_risk', resp.json())

    def test_soil_health_not_own_field(self):
        resp = self.client.get(f'/api/analysis/soil/{self.other_field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated(self):
        resp = self.client.get(f'/api/analysis/soil/{self.field.id}/')
        self.assertEqual(resp.status_code, 401)
