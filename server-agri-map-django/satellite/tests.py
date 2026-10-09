from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase

from fields.models import Field

User = get_user_model()


class SatelliteTest(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('satuser', 's@e.com', 'pass')
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        self.client.force_login(self.user)

    def test_fetch_imagery_open(self):
        resp = self.client.post('/api/satellite/fetch/', {
            'field_id': self.field.id,
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('image_id', resp.json())
        self.assertIn('bands', resp.json())

    def test_fetch_imagery_missing_field_id(self):
        resp = self.client.post('/api/satellite/fetch/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_fetch_imagery_unknown_field(self):
        resp = self.client.post('/api/satellite/fetch/', {'field_id': 9999}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_process_imagery_no_images(self):
        resp = self.client.post('/api/satellite/process/', {
            'field_id': self.field.id,
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_process_imagery_missing_field_id(self):
        resp = self.client.post('/api/satellite/process/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_process_imagery_unknown_field(self):
        resp = self.client.post('/api/satellite/process/', {'field_id': 9999}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_process_imagery_success(self):
        self.client.post('/api/satellite/fetch/', {'field_id': self.field.id}, content_type='application/json')
        resp = self.client.post('/api/satellite/process/', {
            'field_id': self.field.id,
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('job_id', resp.json())
        self.assertEqual(resp.json()['status'], 'completed')

    def test_list_images(self):
        self.client.post('/api/satellite/fetch/', {'field_id': self.field.id}, content_type='application/json')
        resp = self.client.get('/api/satellite/images/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_image_detail(self):
        self.client.post('/api/satellite/fetch/', {'field_id': self.field.id}, content_type='application/json')
        img_resp = self.client.get('/api/satellite/images/')
        image_id = img_resp.json()['results'][0]['id']
        resp = self.client.get(f'/api/satellite/images/{image_id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('bands', resp.json())

    def test_image_detail_missing(self):
        resp = self.client.get('/api/satellite/images/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_delete_image(self):
        self.client.post('/api/satellite/fetch/', {'field_id': self.field.id}, content_type='application/json')
        img_resp = self.client.get('/api/satellite/images/')
        image_id = img_resp.json()['results'][0]['id']
        resp = self.client.delete(f'/api/satellite/images/{image_id}/')
        self.assertEqual(resp.status_code, 204)

    def test_list_jobs(self):
        self.client.post('/api/satellite/fetch/', {'field_id': self.field.id}, content_type='application/json')
        self.client.post('/api/satellite/process/', {'field_id': self.field.id}, content_type='application/json')
        resp = self.client.get('/api/satellite/jobs/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_job_detail(self):
        self.client.post('/api/satellite/fetch/', {'field_id': self.field.id}, content_type='application/json')
        proc = self.client.post('/api/satellite/process/', {'field_id': self.field.id}, content_type='application/json')
        job_id = proc.json()['job_id']
        resp = self.client.get(f'/api/satellite/jobs/{job_id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'completed')

    def test_job_detail_missing(self):
        resp = self.client.get('/api/satellite/jobs/9999/')
        self.assertEqual(resp.status_code, 404)
