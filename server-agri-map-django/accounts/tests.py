from django.contrib.auth import get_user_model
from django.test import TestCase

User = get_user_model()


class HealthTest(TestCase):
    def test_health_endpoint(self):
        resp = self.client.get('/api/health/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'ok')


class AuthTest(TestCase):
    def test_register_success(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'testpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('access', resp.json())
        self.assertIn('refresh', resp.json())
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_register_duplicate_username(self):
        User.objects.create_user('testuser', 'a@b.com', 'testpass123')
        resp = self.client.post('/api/auth/register/', {
            'username': 'testuser',
            'email': 'other@example.com',
            'password': 'testpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_login_success(self):
        User.objects.create_user('testuser', 'test@example.com', 'testpass123')
        resp = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.json())
        self.assertIn('refresh', resp.json())

    def test_login_failure_wrong_password(self):
        User.objects.create_user('testuser', 'test@example.com', 'correctpass')
        resp = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'wrongpass',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_login_failure_missing_fields(self):
        resp = self.client.post('/api/auth/login/', {'username': 'testuser'}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_refresh_token(self):
        User.objects.create_user('testuser', 'test@example.com', 'testpass123')
        login = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123',
        }, content_type='application/json')
        refresh = login.json()['refresh']
        resp = self.client.post('/api/auth/refresh/', {'refresh': refresh}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.json())

    def test_refresh_token_invalid(self):
        resp = self.client.post('/api/auth/refresh/', {'refresh': 'invalidtoken'}, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_me_endpoint_authenticated(self):
        User.objects.create_user('testuser', 'test@example.com', 'testpass123')
        login = self.client.post('/api/auth/login/', {
            'username': 'testuser',
            'password': 'testpass123',
        }, content_type='application/json')
        token = login.json()['access']
        resp = self.client.get('/api/auth/me/', HTTP_AUTHORIZATION=f'Bearer {token}')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['username'], 'testuser')

    def test_me_endpoint_unauthenticated(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 401)
