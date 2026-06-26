from django.contrib.auth import get_user_model
from django.test import TestCase

from fields.models import Field
from farmers.models import Cooperative, CooperativeMember, Farmer
from satellite.models import SatelliteImage
from soil.models import SoilHealthRecord
from carbon.models import CarbonSequestration
from analysis.models import BoundaryDetection, LandDegradation, VegetationIndex

User = get_user_model()


class ComprehensiveSmokeTest(TestCase):
    """Every single API endpoint, exercised in a realistic user flow."""

    def setUp(self):
        # ── Register user A (primary actor) ──
        reg_a = self.client.post('/api/auth/register/', {
            'username': 'alice', 'email': 'a@e.com', 'password': 'secret123',
        }, content_type='application/json')
        self.assertEqual(reg_a.status_code, 201)
        self.alice_token = reg_a.json()['access']
        self.alice_refresh = reg_a.json()['refresh']
        self.alice_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.alice_token}'}
        self.alice = User.objects.get(username='alice')

        # ── Register user B (for cooperative / not-own-field scenarios) ──
        reg_b = self.client.post('/api/auth/register/', {
            'username': 'bob', 'email': 'b@e.com', 'password': 'secret123',
        }, content_type='application/json')
        self.assertEqual(reg_b.status_code, 201)
        self.bob_token = reg_b.json()['access']
        self.bob_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.bob_token}'}
        self.bob = User.objects.get(username='bob')

        # ── Register user C (extra for member mgmt) ──
        reg_c = self.client.post('/api/auth/register/', {
            'username': 'carol', 'email': 'c@e.com', 'password': 'secret123',
        }, content_type='application/json')
        self.assertEqual(reg_c.status_code, 201)
        self.carol_token = reg_c.json()['access']
        self.carol_headers = {'HTTP_AUTHORIZATION': f'Bearer {self.carol_token}'}
        self.carol = User.objects.get(username='carol')

    # ════════════════════════════════════════════
    # HEALTH
    # ════════════════════════════════════════════
    def test_health(self):
        resp = self.client.get('/api/health/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'ok')

    # ════════════════════════════════════════════
    # AUTH
    # ════════════════════════════════════════════
    def test_auth_duplicate_register(self):
        resp = self.client.post('/api/auth/register/', {
            'username': 'alice', 'email': 'a2@e.com', 'password': 'secret123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_auth_login(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'alice', 'password': 'secret123',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.json())
        self.assertIn('refresh', resp.json())

    def test_auth_login_wrong_password(self):
        resp = self.client.post('/api/auth/login/', {
            'username': 'alice', 'password': 'wrong',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_auth_refresh(self):
        resp = self.client.post('/api/auth/refresh/', {
            'refresh': self.alice_refresh,
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('access', resp.json())

    def test_auth_refresh_invalid(self):
        resp = self.client.post('/api/auth/refresh/', {
            'refresh': 'totally-fake-token',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_auth_me(self):
        resp = self.client.get('/api/auth/me/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['username'], 'alice')

    def test_auth_me_unauthenticated(self):
        resp = self.client.get('/api/auth/me/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # FARMER PROFILE
    # ════════════════════════════════════════════
    def test_farmer_register(self):
        resp = self.client.post('/api/farmers/register/', {
            'phone': '+1111111111', 'location': 'Alice Farm',
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertTrue(Farmer.objects.filter(user=self.alice).exists())

    def test_farmer_register_unauthenticated(self):
        resp = self.client.post('/api/farmers/register/', {
            'phone': '+1111111111', 'location': 'Alice Farm',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def _ensure_alice_farmer(self):
        return Farmer.objects.get_or_create(user=self.alice, defaults={'phone': '+1', 'location': 'Home'})[0]

    def _ensure_bob_farmer(self):
        return Farmer.objects.get_or_create(user=self.bob, defaults={'phone': '+2', 'location': 'Bob Farm'})[0]

    def test_farmer_me_get(self):
        self._ensure_alice_farmer()
        resp = self.client.get('/api/farmers/me/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['phone'], '+1')

    def test_farmer_me_update(self):
        self._ensure_alice_farmer()
        resp = self.client.patch('/api/farmers/me/', {
            'phone': '+9999999999',
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['phone'], '+9999999999')

    def test_farmer_me_unauthenticated(self):
        resp = self.client.get('/api/farmers/me/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # FIELDS
    # ════════════════════════════════════════════
    def _create_alice_field(self, name='Alice Field'):
        self._ensure_alice_farmer()
        resp = self.client.post('/api/fields/', {
            'name': name,
            'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        return resp.json()

    def test_field_create(self):
        data = self._create_alice_field()
        self.assertEqual(data['name'], 'Alice Field')
        self.assertIn('centroid_lat', data)
        self.assertIn('centroid_lng', data)

    def test_field_list(self):
        self._create_alice_field()
        self._create_alice_field('Field 2')
        resp = self.client.get('/api/fields/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_field_list_only_own(self):
        self._create_alice_field()
        resp = self.client.get('/api/fields/', **self.bob_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 0)

    def test_field_detail(self):
        data = self._create_alice_field()
        resp = self.client.get(f'/api/fields/{data["id"]}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Alice Field')

    def test_field_detail_not_own(self):
        data = self._create_alice_field()
        resp = self.client.get(f'/api/fields/{data["id"]}/', **self.bob_headers)
        self.assertEqual(resp.status_code, 404)

    def test_field_update(self):
        data = self._create_alice_field()
        resp = self.client.patch(f'/api/fields/{data["id"]}/', {
            'name': 'Updated Field',
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Updated Field')

    def test_field_delete(self):
        data = self._create_alice_field()
        resp = self.client.delete(f'/api/fields/{data["id"]}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 204)

    def test_field_geojson(self):
        self._create_alice_field()
        resp = self.client.get('/api/fields/geojson/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['type'], 'FeatureCollection')
        self.assertEqual(len(resp.json()['features']), 1)

    def test_field_bbox_filter(self):
        self._create_alice_field()
        resp = self.client.get('/api/fields/?bbox=0,0,2,2', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_field_bbox_filter_outside(self):
        self._create_alice_field()
        resp = self.client.get('/api/fields/?bbox=10,10,20,20', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 0)

    def test_field_bbox_invalid(self):
        resp = self.client.get('/api/fields/?bbox=abc', **self.alice_headers)
        self.assertEqual(resp.status_code, 400)

    def test_field_invalid_geometry(self):
        self._ensure_alice_farmer()
        resp = self.client.post('/api/fields/', {
            'name': 'Bad Geo',
            'geometry': {'type': 'InvalidType', 'coordinates': []},
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_field_unauthenticated(self):
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 401)

    def test_field_geojson_unauthenticated(self):
        resp = self.client.get('/api/fields/geojson/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # COOPERATIVES
    # ════════════════════════════════════════════
    def test_cooperative_create(self):
        self._ensure_alice_farmer()
        resp = self.client.post('/api/farmers/cooperatives/', {
            'name': 'Alice Coop', 'description': 'Our coop', 'location': 'Here',
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['created_by'], self.alice.id)

    def test_cooperative_list(self):
        self._ensure_alice_farmer()
        Cooperative.objects.create(name='C1', created_by=self.alice)
        Cooperative.objects.create(name='C2', created_by=self.alice)
        resp = self.client.get('/api/farmers/cooperatives/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_cooperative_detail(self):
        self._ensure_alice_farmer()
        coop = Cooperative.objects.create(name='C1', created_by=self.alice)
        resp = self.client.get(f'/api/farmers/cooperatives/{coop.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'C1')

    # ════════════════════════════════════════════
    # COOPERATIVE MEMBERS
    # ════════════════════════════════════════════
    def _setup_coop(self):
        self._ensure_alice_farmer()
        self._ensure_bob_farmer()
        Farmer.objects.get_or_create(user=self.carol, defaults={'phone': '+3', 'location': 'Carol Farm'})
        return Cooperative.objects.create(name='Test Coop', created_by=self.alice)

    def test_member_add(self):
        coop = self._setup_coop()
        resp = self.client.post(
            f'/api/farmers/cooperatives/{coop.id}/members/',
            {'user_id': self.bob.id},
            **self.alice_headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['farmer_username'], 'bob')

    def test_member_add_with_role(self):
        coop = self._setup_coop()
        resp = self.client.post(
            f'/api/farmers/cooperatives/{coop.id}/members/',
            {'user_id': self.bob.id, 'role': 'admin'},
            **self.alice_headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_member_add_no_farmer_profile(self):
        coop = self._setup_coop()
        no_profile = User.objects.create_user('noprofile', 'n@e.com', 'pass')
        resp = self.client.post(
            f'/api/farmers/cooperatives/{coop.id}/members/',
            {'user_id': no_profile.id},
            **self.alice_headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_member_duplicate_returns_400(self):
        coop = self._setup_coop()
        bob_farmer = Farmer.objects.get(user=self.bob)
        CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer)
        resp = self.client.post(
            f'/api/farmers/cooperatives/{coop.id}/members/',
            {'user_id': self.bob.id},
            **self.alice_headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 400)

    def test_member_list(self):
        coop = self._setup_coop()
        alice_farmer = Farmer.objects.get(user=self.alice)
        bob_farmer = Farmer.objects.get(user=self.bob)
        CooperativeMember.objects.create(cooperative=coop, farmer=alice_farmer, role='admin')
        CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer, role='member')
        resp = self.client.get(
            f'/api/farmers/cooperatives/{coop.id}/members/', **self.alice_headers,
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_member_update_role(self):
        coop = self._setup_coop()
        bob_farmer = Farmer.objects.get(user=self.bob)
        member = CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer, role='member')
        resp = self.client.patch(
            f'/api/farmers/cooperatives/{coop.id}/members/{member.id}/',
            {'role': 'admin'},
            **self.alice_headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_member_remove(self):
        coop = self._setup_coop()
        bob_farmer = Farmer.objects.get(user=self.bob)
        member = CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer, role='member')
        resp = self.client.delete(
            f'/api/farmers/cooperatives/{coop.id}/members/{member.id}/', **self.alice_headers,
        )
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(CooperativeMember.objects.count(), 0)

    def test_member_non_admin_cannot_add(self):
        coop = self._setup_coop()
        bob_farmer = Farmer.objects.get(user=self.bob)
        CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer, role='member')
        resp = self.client.post(
            f'/api/farmers/cooperatives/{coop.id}/members/',
            {'user_id': self.carol.id},
            **self.bob_headers, content_type='application/json',
        )
        self.assertEqual(resp.status_code, 403)

    def test_member_non_admin_cannot_remove(self):
        coop = self._setup_coop()
        bob_farmer = Farmer.objects.get(user=self.bob)
        carol_farmer = Farmer.objects.get(user=self.carol)
        member = CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer, role='member')
        CooperativeMember.objects.create(cooperative=coop, farmer=carol_farmer, role='member')
        resp = self.client.delete(
            f'/api/farmers/cooperatives/{coop.id}/members/{member.id}/',
            **self.carol_headers,
        )
        self.assertEqual(resp.status_code, 403)

    # ════════════════════════════════════════════
    # COOPERATIVE FIELD SHARING
    # ════════════════════════════════════════════
    def test_cooperative_field_sharing(self):
        alice_farmer = self._ensure_alice_farmer()
        self._ensure_bob_farmer()
        coop = Cooperative.objects.create(name='Shared Coop', created_by=self.alice)
        CooperativeMember.objects.create(cooperative=coop, farmer=alice_farmer, role='admin')
        bob_farmer = Farmer.objects.get(user=self.bob)
        CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer, role='member')
        alice_field = Field.objects.create(
            user=self.bob, name="Bob's Field",
            geometry={'type': 'Point', 'coordinates': [2, 2]},
        )
        resp = self.client.get(f'/api/fields/{alice_field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], "Bob's Field")

    # ════════════════════════════════════════════
    # SATELLITE
    # ════════════════════════════════════════════
    def _create_alice_field_for_satellite(self):
        self._ensure_alice_farmer()
        return Field.objects.create(
            user=self.alice, name='Sat Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )

    def test_satellite_fetch(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post('/api/satellite/fetch/', {
            'field_id': field.id,
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('image_id', resp.json())
        self.assertIn('bands', resp.json())

    def test_satellite_fetch_missing_field_id(self):
        resp = self.client.post('/api/satellite/fetch/', {},
                                **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_satellite_fetch_not_own_field(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post('/api/satellite/fetch/', {
            'field_id': field.id,
        }, **self.bob_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_satellite_fetch_unauthenticated(self):
        resp = self.client.post('/api/satellite/fetch/', {'field_id': 1},
                                content_type='application/json')
        self.assertEqual(resp.status_code, 401)

    def test_satellite_process_no_images(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post('/api/satellite/process/', {
            'field_id': field.id,
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_satellite_process_success(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        resp = self.client.post('/api/satellite/process/', {
            'field_id': field.id,
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('job_id', resp.json())
        self.assertEqual(resp.json()['status'], 'completed')

    def test_satellite_image_list(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        resp = self.client.get('/api/satellite/images/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_satellite_image_detail(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        img_id = SatelliteImage.objects.first().id
        resp = self.client.get(f'/api/satellite/images/{img_id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('bands', resp.json())

    def test_satellite_image_delete(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        img_id = SatelliteImage.objects.first().id
        resp = self.client.delete(f'/api/satellite/images/{img_id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 204)

    def test_satellite_image_create_direct(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post('/api/satellite/images/', {
            'field': field.id,
            'date': '2026-06-01',
            'source_url': 'https://example.com/img',
            'cloud_cover': 5.0,
            'bands': {'B02': 0.1, 'B03': 0.2, 'B04': 0.3, 'B08': 0.7},
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(SatelliteImage.objects.count(), 1)

    def test_satellite_job_list(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        self.client.post('/api/satellite/process/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        resp = self.client.get('/api/satellite/jobs/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_satellite_job_detail(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        proc = self.client.post('/api/satellite/process/', {'field_id': field.id},
                                **self.alice_headers, content_type='application/json')
        job_id = proc.json()['job_id']
        resp = self.client.get(f'/api/satellite/jobs/{job_id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'completed')

    def test_satellite_image_list_other_user(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        resp = self.client.get('/api/satellite/images/', **self.bob_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 0)

    def test_satellite_job_detail_other_user(self):
        field = self._create_alice_field_for_satellite()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id},
                         **self.alice_headers, content_type='application/json')
        proc = self.client.post('/api/satellite/process/', {'field_id': field.id},
                                **self.alice_headers, content_type='application/json')
        job_id = proc.json()['job_id']
        resp = self.client.get(f'/api/satellite/jobs/{job_id}/', **self.bob_headers)
        self.assertEqual(resp.status_code, 404)

    # ════════════════════════════════════════════
    # CARBON
    # ════════════════════════════════════════════
    def test_carbon_detail(self):
        field = self._create_alice_field_for_satellite()
        CarbonSequestration.objects.create(
            field=field, carbon_tons=2.3, confidence_score=0.87, methodology='ndvi_based',
        )
        resp = self.client.get(f'/api/carbon/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('carbon_tons', resp.json())

    def test_carbon_detail_not_own(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/carbon/{field.id}/', **self.bob_headers)
        self.assertEqual(resp.status_code, 404)

    def test_carbon_create(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/carbon/{field.id}/create/', {
            'carbon_tons': 5.0,
            'confidence_score': 0.9,
            'methodology': 'soil_organic_carbon',
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['carbon_tons'], 5.0)

    def test_carbon_create_not_own(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/carbon/{field.id}/create/', {
            'carbon_tons': 5.0,
            'confidence_score': 0.9,
            'methodology': 'soil_organic_carbon',
        }, **self.bob_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_carbon_create_invalid(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/carbon/{field.id}/create/', {
            'carbon_tons': -1,
            'confidence_score': 999,
            'methodology': 'invalid',
        }, **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_carbon_unauthenticated(self):
        resp = self.client.get('/api/carbon/999/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # SOIL
    # ════════════════════════════════════════════
    def test_soil_health(self):
        field = self._create_alice_field_for_satellite()
        SoilHealthRecord.objects.create(
            field=field, nitrogen_proxy=0.62, moisture_index=0.48, degradation_risk='moderate',
        )
        resp = self.client.get(f'/api/soil/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('nitrogen_proxy', resp.json())

    def test_soil_not_own(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/soil/{field.id}/', **self.bob_headers)
        self.assertEqual(resp.status_code, 404)

    def test_soil_unauthenticated(self):
        resp = self.client.get('/api/soil/999/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # ANALYSIS
    # ════════════════════════════════════════════
    def test_analysis_vegetation(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/analysis/vegetation/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('indices', resp.json())

    def test_analysis_vegetation_with_data(self):
        field = self._create_alice_field_for_satellite()
        VegetationIndex.objects.create(field=field, ndvi=0.7, evi=0.5, date='2026-06-01')
        resp = self.client.get(f'/api/analysis/vegetation/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['indices']), 1)

    def test_analysis_vegetation_not_own(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/analysis/vegetation/{field.id}/', **self.bob_headers)
        self.assertEqual(resp.status_code, 404)

    def test_analysis_crop_type(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/analysis/crop-type/{field.id}/', {},
                                **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())

    def test_analysis_crop_type_not_own(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/analysis/crop-type/{field.id}/', {},
                                **self.bob_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_analysis_soil_composition(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/analysis/soil-composition/{field.id}/', {},
                                **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_analysis_crop_area(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.post(f'/api/analysis/crop-area/{field.id}/', {},
                                **self.alice_headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_analysis_boundaries_no_data(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/analysis/boundaries/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 404)

    def test_analysis_boundaries(self):
        field = self._create_alice_field_for_satellite()
        BoundaryDetection.objects.create(
            field=field,
            boundary_geojson={'type': 'Polygon', 'coordinates': [[[0,0],[1,0],[1,1],[0,1],[0,0]]]},
        )
        resp = self.client.get(f'/api/analysis/boundaries/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('boundary', resp.json())

    def test_analysis_trends_no_data(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/analysis/trends/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 404)

    def test_analysis_trends(self):
        field = self._create_alice_field_for_satellite()
        VegetationIndex.objects.create(field=field, ndvi=0.7, evi=0.5, date='2026-06-01')
        VegetationIndex.objects.create(field=field, ndvi=0.6, evi=0.4, date='2026-07-01')
        resp = self.client.get(f'/api/analysis/trends/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('trend', resp.json())

    def test_analysis_degradation_no_data(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/analysis/degradation/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 404)

    def test_analysis_degradation(self):
        field = self._create_alice_field_for_satellite()
        LandDegradation.objects.create(field=field, severity='low', score=0.2)
        resp = self.client.get(f'/api/analysis/degradation/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('severity', resp.json())

    def test_analysis_unauthenticated(self):
        resp = self.client.get('/api/analysis/vegetation/999/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # REPORTS
    # ════════════════════════════════════════════
    def test_report(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/reports/field/{field.id}/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('field_name', resp.json())
        self.assertIn('crop', resp.json())

    def test_report_not_own(self):
        field = self._create_alice_field_for_satellite()
        resp = self.client.get(f'/api/reports/field/{field.id}/', **self.bob_headers)
        self.assertEqual(resp.status_code, 404)

    def test_report_unauthenticated(self):
        resp = self.client.get('/api/reports/field/999/')
        self.assertEqual(resp.status_code, 401)

    # ════════════════════════════════════════════
    # SCHEMA & DOCS
    # ════════════════════════════════════════════
    def test_openapi_schema(self):
        resp = self.client.get('/api/schema/?format=json', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
        self.assertIn('openapi', resp.json())

    def test_swagger_ui(self):
        resp = self.client.get('/api/docs/', **self.alice_headers)
        self.assertEqual(resp.status_code, 200)
