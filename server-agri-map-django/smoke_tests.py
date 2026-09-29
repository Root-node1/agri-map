from django.contrib.auth import get_user_model
from django.test import TestCase

from analysis.models import BoundaryDetection, LandDegradation, VegetationIndex
from carbon.models import CarbonSequestration
from farmers.models import Cooperative, CooperativeMember, Farmer
from fields.models import Field
from satellite.models import SatelliteImage
from soil.models import SoilHealthRecord

User = get_user_model()


class ComprehensiveSmokeTest(TestCase):
    def setUp(self):
        self.alice = User.objects.create_user('alice', 'a@e.com', 'pass')
        self.bob = User.objects.create_user('bob', 'b@e.com', 'pass')

    # ── HEALTH ──
    def test_health(self):        resp = self.client.get('/api/health/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'ok')

    def test_auth_routes_gone(self):
        for url, method in [
            ('/api/auth/register/', 'post'), ('/api/auth/login/', 'post'),
            ('/api/auth/refresh/', 'post'), ('/api/auth/me/', 'get'),
        ]:
            if method == 'post':
                resp = self.client.post(url, {}, content_type='application/json')
            else:
                resp = self.client.get(url)
            self.assertEqual(resp.status_code, 404, url)

    # ── FARMER PROFILE ──
    def test_farmer_register(self):
        resp = self.client.post('/api/farmers/register/', {
            'phone': '+1111111111', 'location': 'Alice Farm',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)

    def _ensure_alice_farmer(self):
        return Farmer.objects.get_or_create(user=self.alice, defaults={'phone': '+1', 'location': 'Home'})[0]

    def _ensure_bob_farmer(self):
        return Farmer.objects.get_or_create(user=self.bob, defaults={'phone': '+2', 'location': 'Bob Farm'})[0]

    def test_farmer_me_get(self):
        self._ensure_alice_farmer()
        resp = self.client.get('/api/farmers/me/')
        self.assertEqual(resp.status_code, 200)

    def test_farmer_me_update(self):
        self._ensure_alice_farmer()
        resp = self.client.patch('/api/farmers/me/', {'phone': '+9999999999'}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['phone'], '+9999999999')

    # ── FIELDS ──
    def _create_field(self, name='Alice Field'):
        resp = self.client.post('/api/fields/', {
            'name': name,
            'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]},
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        return resp.json()

    def test_field_create(self):
        data = self._create_field()
        self.assertEqual(data['name'], 'Alice Field')
        self.assertIn('centroid_lat', data)

    def test_field_list(self):
        self._create_field()
        self._create_field('Field 2')
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_field_list_open_to_everyone(self):
        self._create_field()
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_field_detail(self):
        data = self._create_field()
        resp = self.client.get(f'/api/fields/{data["id"]}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Alice Field')

    def test_field_detail_missing(self):
        resp = self.client.get('/api/fields/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_field_update(self):
        data = self._create_field()
        resp = self.client.patch(f'/api/fields/{data["id"]}/', {'name': 'Updated Field'},
                                 content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Updated Field')

    def test_field_delete(self):
        data = self._create_field()
        resp = self.client.delete(f'/api/fields/{data["id"]}/')
        self.assertEqual(resp.status_code, 204)

    def test_field_geojson(self):
        self._create_field()
        resp = self.client.get('/api/fields/geojson/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['type'], 'FeatureCollection')
        self.assertEqual(len(resp.json()['features']), 1)

    def test_field_bbox_filter(self):
        self._create_field()
        resp = self.client.get('/api/fields/?bbox=0,0,2,2')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_field_bbox_filter_outside(self):
        self._create_field()
        resp = self.client.get('/api/fields/?bbox=10,10,20,20')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 0)

    def test_field_bbox_invalid(self):
        resp = self.client.get('/api/fields/?bbox=abc')
        self.assertEqual(resp.status_code, 400)

    def test_field_invalid_geometry(self):
        resp = self.client.post('/api/fields/', {
            'name': 'Bad Geo',
            'geometry': {'type': 'InvalidType', 'coordinates': []},
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    # ── COOPERATIVES ──
    def test_cooperative_create(self):
        self._ensure_alice_farmer()
        resp = self.client.post('/api/farmers/cooperatives/', {
            'name': 'Alice Coop', 'description': 'Our coop', 'location': 'Here',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)

    def test_cooperative_list(self):
        Cooperative.objects.create(name='C1', created_by=self.alice)
        Cooperative.objects.create(name='C2', created_by=self.alice)
        resp = self.client.get('/api/farmers/cooperatives/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_cooperative_detail(self):
        coop = Cooperative.objects.create(name='C1', created_by=self.alice)
        resp = self.client.get(f'/api/farmers/cooperatives/{coop.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'C1')

    # ── COOPERATIVE MEMBERS ──
    def _setup_coop(self):
        self._ensure_alice_farmer()
        self._ensure_bob_farmer()
        return Cooperative.objects.create(name='Test Coop', created_by=self.alice)

    def test_member_add(self):
        coop = self._setup_coop()
        resp = self.client.post(f'/api/farmers/cooperatives/{coop.id}/members/',
                                {'user_id': self.bob.id}, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['farmer_username'], 'bob')

    def test_member_add_with_role(self):
        coop = self._setup_coop()
        resp = self.client.post(f'/api/farmers/cooperatives/{coop.id}/members/',
                                {'user_id': self.bob.id, 'role': 'admin'}, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_member_add_no_farmer_profile(self):
        coop = self._setup_coop()
        no_profile = User.objects.create_user('noprofile', 'n@e.com', 'pass')
        resp = self.client.post(f'/api/farmers/cooperatives/{coop.id}/members/',
                                {'user_id': no_profile.id}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_member_duplicate_returns_400(self):
        coop = self._setup_coop()
        bob_farmer = Farmer.objects.get(user=self.bob)
        CooperativeMember.objects.create(cooperative=coop, farmer=bob_farmer)
        resp = self.client.post(f'/api/farmers/cooperatives/{coop.id}/members/',
                                {'user_id': self.bob.id}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_member_list(self):
        coop = self._setup_coop()
        CooperativeMember.objects.create(cooperative=coop, farmer=Farmer.objects.get(user=self.alice), role='admin')
        CooperativeMember.objects.create(cooperative=coop, farmer=Farmer.objects.get(user=self.bob), role='member')
        resp = self.client.get(f'/api/farmers/cooperatives/{coop.id}/members/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 2)

    def test_member_update_role(self):
        coop = self._setup_coop()
        member = CooperativeMember.objects.create(cooperative=coop, farmer=Farmer.objects.get(user=self.bob))
        resp = self.client.patch(f'/api/farmers/cooperatives/{coop.id}/members/{member.id}/',
                                 {'role': 'admin'}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['role'], 'admin')

    def test_member_remove(self):
        coop = self._setup_coop()
        member = CooperativeMember.objects.create(cooperative=coop, farmer=Farmer.objects.get(user=self.bob))
        resp = self.client.delete(f'/api/farmers/cooperatives/{coop.id}/members/{member.id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(CooperativeMember.objects.count(), 0)

    # ── SATELLITE ──
    def _sat_field(self):
        return Field.objects.create(user=self.alice, name='Sat Field',
                                    geometry={'type': 'Point', 'coordinates': [0, 0]})

    def test_satellite_fetch(self):
        field = self._sat_field()
        resp = self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertIn('image_id', resp.json())

    def test_satellite_fetch_missing_field_id(self):
        resp = self.client.post('/api/satellite/fetch/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_satellite_fetch_unknown_field(self):
        resp = self.client.post('/api/satellite/fetch/', {'field_id': 9999}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_satellite_process_no_images(self):
        field = self._sat_field()
        resp = self.client.post('/api/satellite/process/', {'field_id': field.id}, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_satellite_process_success(self):
        field = self._sat_field()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        resp = self.client.post('/api/satellite/process/', {'field_id': field.id}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['status'], 'completed')

    def test_satellite_image_list(self):
        field = self._sat_field()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        resp = self.client.get('/api/satellite/images/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_satellite_image_detail(self):
        field = self._sat_field()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        img_id = SatelliteImage.objects.first().id
        resp = self.client.get(f'/api/satellite/images/{img_id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('bands', resp.json())

    def test_satellite_image_delete(self):
        field = self._sat_field()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        img_id = SatelliteImage.objects.first().id
        resp = self.client.delete(f'/api/satellite/images/{img_id}/')
        self.assertEqual(resp.status_code, 204)

    def test_satellite_image_create_direct(self):
        field = self._sat_field()
        resp = self.client.post('/api/satellite/images/', {
            'field': field.id, 'date': '2026-06-01', 'source_url': 'https://example.com/img',
            'cloud_cover': 5.0, 'bands': {'B02': 0.1, 'B03': 0.2, 'B04': 0.3, 'B08': 0.7},
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(SatelliteImage.objects.count(), 1)

    def test_satellite_job_list(self):
        field = self._sat_field()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        self.client.post('/api/satellite/process/', {'field_id': field.id}, content_type='application/json')
        resp = self.client.get('/api/satellite/jobs/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['results']), 1)

    def test_satellite_job_detail(self):
        field = self._sat_field()
        self.client.post('/api/satellite/fetch/', {'field_id': field.id}, content_type='application/json')
        proc = self.client.post('/api/satellite/process/', {'field_id': field.id}, content_type='application/json')
        resp = self.client.get(f'/api/satellite/jobs/{proc.json()["job_id"]}/')
        self.assertEqual(resp.status_code, 200)

    # ── CARBON ──
    def test_carbon_detail(self):
        field = self._sat_field()
        CarbonSequestration.objects.create(field=field, carbon_tons=2.3, confidence_score=0.87, methodology='ndvi_based')
        resp = self.client.get(f'/api/carbon/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('carbon_tons', resp.json())

    def test_carbon_detail_missing(self):
        resp = self.client.get('/api/carbon/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_carbon_create(self):
        field = self._sat_field()
        resp = self.client.post(f'/api/carbon/{field.id}/create/', {
            'carbon_tons': 5.0, 'confidence_score': 0.9, 'methodology': 'soil_organic_carbon',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 201)

    def test_carbon_create_invalid(self):
        field = self._sat_field()
        resp = self.client.post(f'/api/carbon/{field.id}/create/', {
            'carbon_tons': -1, 'confidence_score': 999, 'methodology': 'invalid',
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    # ── SOIL ──
    def test_soil_health(self):
        field = self._sat_field()
        SoilHealthRecord.objects.create(field=field, nitrogen_proxy=0.62, moisture_index=0.48, degradation_risk='moderate')
        resp = self.client.get(f'/api/soil/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('nitrogen_proxy', resp.json())

    def test_soil_missing(self):
        resp = self.client.get('/api/soil/9999/')
        self.assertEqual(resp.status_code, 404)

    # ── ANALYSIS ──
    def test_analysis_vegetation(self):
        field = self._sat_field()
        resp = self.client.get(f'/api/analysis/vegetation/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('indices', resp.json())

    def test_analysis_vegetation_with_data(self):
        field = self._sat_field()
        VegetationIndex.objects.create(field=field, ndvi=0.7, evi=0.5, date='2026-06-01')
        resp = self.client.get(f'/api/analysis/vegetation/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(len(resp.json()['indices']), 1)

    def test_analysis_crop_type(self):
        field = self._sat_field()
        resp = self.client.post(f'/api/analysis/crop-type/{field.id}/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('crop_type', resp.json())

    def test_analysis_soil_composition(self):
        field = self._sat_field()
        resp = self.client.post(f'/api/analysis/soil-composition/{field.id}/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_analysis_crop_area(self):
        field = self._sat_field()
        resp = self.client.post(f'/api/analysis/crop-area/{field.id}/', {}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('prediction', resp.json())

    def test_analysis_boundaries_no_data(self):
        field = self._sat_field()
        resp = self.client.get(f'/api/analysis/boundaries/{field.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_analysis_boundaries(self):
        field = self._sat_field()
        BoundaryDetection.objects.create(field=field, boundary_geojson={'type': 'Polygon', 'coordinates': [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]]})
        resp = self.client.get(f'/api/analysis/boundaries/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('boundary', resp.json())

    def test_analysis_trends_no_data(self):
        field = self._sat_field()
        resp = self.client.get(f'/api/analysis/trends/{field.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_analysis_trends(self):
        field = self._sat_field()
        VegetationIndex.objects.create(field=field, ndvi=0.7, evi=0.5, date='2026-06-01')
        VegetationIndex.objects.create(field=field, ndvi=0.6, evi=0.4, date='2026-07-01')
        resp = self.client.get(f'/api/analysis/trends/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('trend', resp.json())

    def test_analysis_degradation_no_data(self):
        field = self._sat_field()
        resp = self.client.get(f'/api/analysis/degradation/{field.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_analysis_degradation(self):
        field = self._sat_field()
        LandDegradation.objects.create(field=field, severity='low', score=0.2)
        resp = self.client.get(f'/api/analysis/degradation/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('severity', resp.json())

    # ── REPORTS ──
    def test_report(self):
        field = self._sat_field()
        resp = self.client.get(f'/api/reports/field/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('field_name', resp.json())

    def test_report_missing(self):
        resp = self.client.get('/api/reports/field/9999/')
        self.assertEqual(resp.status_code, 404)

    # ── SCHEMA & DOCS ──
    def test_openapi_schema(self):
        resp = self.client.get('/api/schema/?format=json')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('openapi', resp.json())

    def test_swagger_ui(self):
        resp = self.client.get('/api/docs/')
        self.assertEqual(resp.status_code, 200)
