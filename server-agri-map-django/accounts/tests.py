from django.test import TestCase


class HealthTest(TestCase):
    def test_health_endpoint_open(self):
        resp = self.client.get('/api/health/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'ok')


class EmailAuthTest(TestCase):
    """Email is the login identity; client sends {email, password}."""

    def test_register_login_refresh_me_logout_flow(self):
        resp = self.client.post('/api/auth/register/', {
            'name': 'Alice', 'email': 'alice@e.com', 'password': 'longpass123',
            'role': 'farmer', 'phone': '+111',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        body = resp.json()
        self.assertIn('access', body)
        self.assertIn('refresh', body)
        self.assertEqual(body['user']['email'], 'alice@e.com')
        self.assertEqual(body['user']['role'], 'farmer')
        # Phone saved but location missing -> farmer profile incomplete.
        self.assertTrue(body['needsProfile'])

        resp = self.client.post('/api/auth/login/', {
            'email': 'alice@e.com', 'password': 'longpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('user', resp.json())
        self.assertEqual(resp.json()['user']['email'], 'alice@e.com')
        refresh = resp.json()['refresh']

        resp = self.client.get('/api/auth/me/', HTTP_AUTHORIZATION=f"Bearer {resp.json()['access']}")
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['role'], 'farmer')

        resp = self.client.post('/api/auth/refresh/', {'refresh': refresh},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 200)

        resp = self.client.post('/api/auth/logout/', {'refresh': resp.json()['refresh']},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_login_case_insensitive_email(self):
        self.client.post('/api/auth/register/', {
            'email': 'Bob@E.com', 'password': 'longpass123',
        }, content_type='application/json')
        resp = self.client.post('/api/auth/login/', {
            'email': 'bob@e.com', 'password': 'longpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_register_duplicate_email_rejected(self):
        self.client.post('/api/auth/register/', {
            'email': 'dup@e.com', 'password': 'longpass123',
        }, content_type='application/json')
        resp = self.client.post('/api/auth/register/', {
            'email': 'dup@e.com', 'password': 'longpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_legacy_username_login_still_works(self):
        self.client.post('/api/auth/register/', {
            'username': 'carol', 'email': 'c@e.com', 'password': 'longpass123',
        }, content_type='application/json')
        resp = self.client.post('/api/auth/login/', {
            'username': 'carol', 'password': 'longpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_forgot_reset_flow(self):
        from django.contrib.auth import get_user_model
        from django.contrib.auth.tokens import PasswordResetTokenGenerator
        from django.utils.encoding import force_bytes
        from django.utils.http import urlsafe_base64_encode

        self.client.post('/api/auth/register/', {
            'email': 'f@e.com', 'password': 'longpass123',
        }, content_type='application/json')
        resp = self.client.post('/api/auth/forgot-password/', {'email': 'f@e.com'},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        user = get_user_model().objects.get(email__iexact='f@e.com')
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        resp = self.client.post('/api/auth/reset-password/', {
            'token': f'{uid}:{token}', 'new_password': 'newlongpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        resp = self.client.post('/api/auth/login/', {
            'email': 'f@e.com', 'password': 'newlongpass123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_forgot_unknown_email_still_success(self):
        resp = self.client.post('/api/auth/forgot-password/', {'email': 'nobody@e.com'},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_logout_without_refresh_still_200(self):
        resp = self.client.post('/api/auth/logout/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)

    def test_users_list_staff_only(self):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        admin = User.objects.create_superuser('admin', 'admin@e.com', 'longpass123')
        user = User.objects.create_user('plain', 'plain@e.com', 'longpass123')
        self.client.force_login(admin)
        resp = self.client.get('/api/auth/users/')
        self.assertEqual(resp.status_code, 200)
        body = resp.json()
        users = body.get('users', body.get('results', []))
        self.assertTrue(any(u.get('email') == 'plain@e.com' for u in users))
        self.assertIn('_id', users[0])
        self.client.force_login(user)
        resp = self.client.get('/api/auth/users/')
        self.assertEqual(resp.status_code, 403)
