from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Field

User = get_user_model()


class FieldTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('fieldowner', 'f@e.com', 'pass')
        self.user2 = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'fieldowner', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_create_field(self):
        resp = self.client.post('/api/fields/', {
            'name': 'North Field',
            'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
            'area_ha': 10.5,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Field.objects.count(), 1)

    def test_list_fields_only_own(self):
        Field.objects.create(user=self.user, name='My Field', geometry={'type': 'Point', 'coordinates': [0, 0]})
        Field.objects.create(user=self.user2, name='Not Mine', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get('/api/fields/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'My Field')

    def test_field_detail_own(self):
        field = Field.objects.create(user=self.user, name='My Field', geometry={'type': 'Point', 'coordinates': [0, 0]})
        resp = self.client.get(f'/api/fields/{field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'My Field')

    def test_field_detail_not_own(self):
        field = Field.objects.create(user=self.user2, name='Not Mine', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get(f'/api/fields/{field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_field_unauthenticated(self):
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 401)
