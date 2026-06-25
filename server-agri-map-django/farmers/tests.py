from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Cooperative, CooperativeMember, Farmer

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


class CooperativeMemberTest(TestCase):
    def setUp(self):
        self.admin_user = User.objects.create_user('admin', 'a@e.com', 'pass')
        self.member_user = User.objects.create_user('member', 'm@e.com', 'pass')
        self.admin_farmer = Farmer.objects.create(user=self.admin_user)
        self.member_farmer = Farmer.objects.create(user=self.member_user)

        login = self.client.post('/api/auth/login/', {
            'username': 'admin', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

        self.coop = Cooperative.objects.create(name='Test Coop', created_by=self.admin_user)

    def test_add_member(self):
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.member_user.id},
            **self.headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(CooperativeMember.objects.count(), 1)
        self.assertEqual(resp.json()['farmer_username'], 'member')

    def test_add_member_with_role(self):
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.member_user.id, 'role': 'admin'},
            **self.headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_add_member_no_farmer_profile(self):
        no_farmer = User.objects.create_user('nofarmer', 'n@e.com', 'pass')
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': no_farmer.id},
            **self.headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_list_members(self):
        CooperativeMember.objects.create(cooperative=self.coop, farmer=self.admin_farmer, role='admin')
        CooperativeMember.objects.create(cooperative=self.coop, farmer=self.member_farmer, role='member')
        resp = self.client.get(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            **self.headers,
        )
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        self.assertEqual(len(results), 2)
        usernames = {r['farmer_username'] for r in results}
        self.assertIn('admin', usernames)
        self.assertIn('member', usernames)

    def test_non_admin_cannot_add(self):
        login = self.client.post('/api/auth/login/', {
            'username': 'member', 'password': 'pass',
        }, content_type='application/json')
        token = login.json()['access']
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.admin_user.id},
            **headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_update_member_role(self):
        member = CooperativeMember.objects.create(
            cooperative=self.coop, farmer=self.member_farmer, role='member',
        )
        resp = self.client.patch(
            f'/api/farmers/cooperatives/{self.coop.id}/members/{member.id}/',
            {'role': 'admin'},
            **self.headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_remove_member(self):
        member = CooperativeMember.objects.create(
            cooperative=self.coop, farmer=self.member_farmer, role='member',
        )
        resp = self.client.delete(
            f'/api/farmers/cooperatives/{self.coop.id}/members/{member.id}/',
            **self.headers,
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(CooperativeMember.objects.count(), 0)

    def test_non_admin_cannot_remove(self):
        member = CooperativeMember.objects.create(
            cooperative=self.coop, farmer=self.member_farmer, role='member',
        )
        login = self.client.post('/api/auth/login/', {
            'username': 'member', 'password': 'pass',
        }, content_type='application/json')
        token = login.json()['access']
        headers = {'HTTP_AUTHORIZATION': f'Bearer {token}'}
        resp = self.client.delete(
            f'/api/farmers/cooperatives/{self.coop.id}/members/{member.id}/',
            **headers,
        )
        self.assertEqual(resp.status_code, 403)
