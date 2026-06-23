from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Cooperative, Farmer

User = get_user_model()


class FarmerTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('farmer', 'f@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'farmer', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_farmer_register(self):
        resp = self.client.post('/api/farmers/register/', {
            'phone': '+1234567890', 'location': 'Test Farm',
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Farmer.objects.filter(user=self.user).exists())

    def test_farmer_register_unauthenticated(self):
        resp = self.client.post('/api/farmers/register/', {
            'phone': '+1234567890', 'location': 'Test Farm',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_farmer_me(self):
        Farmer.objects.create(user=self.user, phone='+123', location='Farm')
        resp = self.client.get('/api/farmers/me/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['phone'], '+123')

    def test_farmer_me_unauthenticated(self):
        resp = self.client.get('/api/farmers/me/')
        self.assertEqual(resp.status_code, 401)


class CooperativeTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('coopowner', 'c@e.com', 'pass')
        Farmer.objects.create(user=self.user)
        login = self.client.post('/api/auth/login/', {
            'username': 'coopowner', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_create_cooperative(self):
        resp = self.client.post('/api/farmers/cooperatives/', {
            'name': 'Test Coop', 'description': 'A test', 'location': 'Here',
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Cooperative.objects.count(), 1)
        self.assertEqual(resp.json()['created_by'], self.user.id)

    def test_list_cooperatives(self):
        Cooperative.objects.create(name='Coop A', created_by=self.user)
        Cooperative.objects.create(name='Coop B', created_by=self.user)
        resp = self.client.get('/api/farmers/cooperatives/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_cooperative_detail(self):
        coop = Cooperative.objects.create(name='Coop A', created_by=self.user)
        resp = self.client.get(f'/api/farmers/cooperatives/{coop.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Coop A')
