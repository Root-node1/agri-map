from django.test import TestCase


class HealthTest(TestCase):
    def test_health_endpoint_open(self):
        resp = self.client.get('/api/health/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'ok')


class AuthRemovedTest(TestCase):
    def test_register_route_gone(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'x', 'email': 'x@e.com', 'password': 'pass12345',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_login_route_gone(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'x', 'password': 'pass12345',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_refresh_route_gone(self):
        resp = self.client.post('/api/auth/refresh/', {'refresh': 'x'}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_me_route_gone(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 404)

    def test_fields_open_without_auth(self):
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 200)

    def test_schema_open_without_auth(self):
        resp = self.client.get('/api/schema/?format=json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('openapi', resp.json())
