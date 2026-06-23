from django.contrib.auth import get_user_model
from django.test import TestCase

from analysis.models import CropPrediction
from fields.models import Field

User = get_user_model()


class ReportTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('repuser', 'r@e.com', 'pass')
        self.other = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'repuser', 'password': 'pass',
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

    def test_report_generation(self):
        resp = self.client.get(f'/api/reports/field/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('field_id', resp.json())
        self.assertEqual(resp.json()['field_name'], 'Test Field')

    def test_report_with_data(self):
        CropPrediction.objects.create(field=self.field, crop_type='Maize', confidence=0.92)
        resp = self.client.get(f'/api/reports/field/{self.field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIsNotNone(resp.json().get('crop'))

    def test_report_not_own_field(self):
        resp = self.client.get(f'/api/reports/field/{self.other_field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_unauthenticated(self):
        resp = self.client.get(f'/api/reports/field/{self.field.id}/')
        self.assertEqual(resp.status_code, 401)
