from django.contrib.auth import get_user_model
from django.test import TestCase

from fields.models import Field

User = get_user_model()


class SatelliteTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('satuser', 's@e.com', 'pass')
        self.other = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'satuser', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )

    def test_fetch_imagery(self):
        resp = self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('image_id', resp.json())
        self.assertIn('bands', resp.json())

    def test_fetch_imagery_missing_field_id(self):
        resp = self.client.post('/api/satellite/fetch/', {}, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_fetch_imagery_not_own_field(self):
        other_field = Field.objects.create(
            user=self.other, name='Other',
            geometry={'type': 'Point', 'coordinates': [1, 1]},
        )
        resp = self.client.post('/api/satellite/fetch/', {
            'field_id': other_field.id,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_process_imagery_no_images(self):
        resp = self.client.post('/api/satellite/process/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_process_imagery_success(self):
        self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        resp = self.client.post('/api/satellite/process/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('job_id', resp.json())
        self.assertEqual(resp.json()['status'], 'completed')

    def test_unauthenticated(self):
        resp = self.client.post('/api/satellite/fetch/', {'field_id': 1}, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_list_images(self):
        self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        resp = self.client.get('/api/satellite/images/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_image_detail(self):
        self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        img_resp = self.client.get('/api/satellite/images/', **self.headers)
        image_id = img_resp.json()['results'][0]['id']
        resp = self.client.get(f'/api/satellite/images/{image_id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('bands', resp.json())

    def test_delete_image(self):
        self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        img_resp = self.client.get('/api/satellite/images/', **self.headers)
        image_id = img_resp.json()['results'][0]['id']
        resp = self.client.delete(f'/api/satellite/images/{image_id}/', **self.headers)
        self.assertEqual(resp.status_code, 204)

    def test_list_jobs(self):
        self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        self.client.post('/api/satellite/process/', {
            'field_id': self.field.id,
        }, **self.headers, content_type='application/json')
        resp = self.client.get('/api/satellite/jobs/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)
