from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Cooperative, CooperativeMember, Farmer

User = get_user_model()


def make_user(username):
    return User.objects.create_user(username, f'{username}@e.com', 'pass')


class FarmerTest(TestCase):
    def test_farmer_register_open(self):
        resp = self.client.post('/api/farmers/register/', {
            'phone': '+1234567890', 'location': 'Test Farm',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Farmer.objects.count(), 1)

    def test_farmer_me_open_auto_creates(self):
        resp = self.client.get('/api/farmers/me/')
        self.assertEqual(resp.status_code, 200)
        self.assertTrue(Farmer.objects.exists())

    def test_farmer_me_update(self):
        self.client.get('/api/farmers/me/')
        resp = self.client.patch('/api/farmers/me/', {'phone': '+999', 'location': 'Updated'},
                                 content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['phone'], '+999')

    def test_farmer_str(self):
        user = make_user('strfarmer')
        farmer = Farmer.objects.create(user=user)
        self.assertEqual(str(farmer), 'strfarmer')


class CooperativeTest(TestCase):
    def setUp(self):
        self.user = make_user('coopowner')
        Farmer.objects.create(user=self.user)

    def test_create_cooperative_open(self):
        resp = self.client.post('/api/farmers/cooperatives/', {
            'name': 'Test Coop', 'description': 'A test', 'location': 'Here',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Cooperative.objects.count(), 1)

    def test_create_cooperative_missing_name(self):
        resp = self.client.post('/api/farmers/cooperatives/', {
            'description': 'no name',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_list_cooperatives(self):
        Cooperative.objects.create(name='Coop A', created_by=self.user)
        Cooperative.objects.create(name='Coop B', created_by=self.user)
        resp = self.client.get('/api/farmers/cooperatives/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_cooperative_detail(self):
        coop = Cooperative.objects.create(name='Coop A', created_by=self.user)
        resp = self.client.get(f'/api/farmers/cooperatives/{coop.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Coop A')

    def test_cooperative_detail_missing(self):
        resp = self.client.get('/api/farmers/cooperatives/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_cooperative_member_count(self):
        coop = Cooperative.objects.create(name='Counted', created_by=self.user)
        farmer = Farmer.objects.get(user=self.user)
        CooperativeMember.objects.create(cooperative=coop, farmer=farmer)
        resp = self.client.get(f'/api/farmers/cooperatives/{coop.id}/')
        self.assertEqual(resp.json()['member_count'], 1)

    def test_cooperative_str(self):
        coop = Cooperative.objects.create(name='Named', created_by=self.user)
        self.assertEqual(str(coop), 'Named')


class CooperativeMemberTest(TestCase):
    def setUp(self):
        self.admin_user = make_user('admin')
        self.member_user = make_user('member')
        self.admin_farmer = Farmer.objects.create(user=self.admin_user)
        self.member_farmer = Farmer.objects.create(user=self.member_user)
        self.coop = Cooperative.objects.create(name='Test Coop', created_by=self.admin_user)

    def test_add_member_open(self):
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.member_user.id},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(CooperativeMember.objects.count(), 1)
        self.assertEqual(resp.json()['farmer_username'], 'member')

    def test_add_member_with_role(self):
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.member_user.id, 'role': 'admin'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_add_member_no_farmer_profile(self):
        no_farmer = make_user('nofarmer')
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': no_farmer.id},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_add_member_missing_user_id(self):
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_add_member_missing_coop(self):
        resp = self.client.post(
            '/api/farmers/cooperatives/9999/members/',
            {'user_id': self.member_user.id},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 404)

    def test_list_members(self):
        CooperativeMember.objects.create(cooperative=self.coop, farmer=self.admin_farmer, role='admin')
        CooperativeMember.objects.create(cooperative=self.coop, farmer=self.member_farmer, role='member')
        resp = self.client.get(f'/api/farmers/cooperatives/{self.coop.id}/members/')
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        self.assertEqual(len(results), 2)
        usernames = {r['farmer_username'] for r in results}
        self.assertIn('admin', usernames)
        self.assertIn('member', usernames)

    def test_update_member_role(self):
        member = CooperativeMember.objects.create(
            cooperative=self.coop, farmer=self.member_farmer, role='member',
        )
        resp = self.client.patch(
            f'/api/farmers/cooperatives/{self.coop.id}/members/{member.id}/',
            {'role': 'admin'},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_remove_member(self):
        member = CooperativeMember.objects.create(
            cooperative=self.coop, farmer=self.member_farmer, role='member',
        )
        resp = self.client.delete(f'/api/farmers/cooperatives/{self.coop.id}/members/{member.id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(CooperativeMember.objects.count(), 0)

    def test_duplicate_member_returns_400(self):
        CooperativeMember.objects.create(cooperative=self.coop, farmer=self.member_farmer, role='member')
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.member_user.id},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_member_detail_missing(self):
        resp = self.client.get(f'/api/farmers/cooperatives/{self.coop.id}/members/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_member_str(self):
        member = CooperativeMember.objects.create(cooperative=self.coop, farmer=self.member_farmer)
        self.assertIn('Test Coop', str(member))

    def test_anyone_can_manage_members(self):
        outsider = make_user('outsider')
        Farmer.objects.create(user=outsider)
        resp = self.client.post(
            f'/api/farmers/cooperatives/{self.coop.id}/members/',
            {'user_id': self.member_user.id},
            content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
