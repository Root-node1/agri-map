from django.contrib.auth import get_user_model
from django.test import TestCase

from .models import Field

User = get_user_model()


class FieldModelTest(TestCase):
    def test_centroid_point(self):
        field = Field.objects.create(
            user=User.objects.create_user('u1', 'u1@e.com', 'pass'),
            name='Point Field',
            geometry={'type': 'Point', 'coordinates': [30.5, 50.2]},
        )
        self.assertAlmostEqual(field.centroid_lat, 50.2)
        self.assertAlmostEqual(field.centroid_lng, 30.5)

    def test_centroid_polygon(self):
        field = Field.objects.create(
            user=User.objects.create_user('u2', 'u2@e.com', 'pass'),
            name='Poly Field',
            geometry={'type': 'Polygon', 'coordinates': [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]},
        )
        self.assertAlmostEqual(field.centroid_lat, 5.0)
        self.assertAlmostEqual(field.centroid_lng, 5.0)

    def test_centroid_multipolygon(self):
        field = Field.objects.create(
            user=User.objects.create_user('u3', 'u3@e.com', 'pass'),
            name='Multi Field',
            geometry={
                'type': 'MultiPolygon',
                'coordinates': [
                    [[[0, 0], [0, 2], [2, 2], [2, 0], [0, 0]]],
                    [[[4, 4], [4, 6], [6, 6], [6, 4], [4, 4]]],
                ],
            },
        )
        self.assertAlmostEqual(field.centroid_lat, 3.0)
        self.assertAlmostEqual(field.centroid_lng, 3.0)


class FieldAPITest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('fieldowner', 'f@e.com', 'pass')
        self.user2 = User.objects.create_user('other', 'o@e.com', 'pass')
        login = self.client.post('/api/auth/login/', {
            'username': 'fieldowner', 'password': 'pass',
        }, content_type='application/json')
        self.token = login.json()['access']
        self.headers = {'HTTP_AUTHORIZATION': f'Bearer {self.token}'}

    def test_create_field(self):
        resp = self.client.post('/api/fields/', {
            'name': 'North Field',
            'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
            'area_ha': 10.5,
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Field.objects.count(), 1)
        field = Field.objects.first()
        self.assertIsNotNone(field.centroid_lat)
        self.assertIsNotNone(field.centroid_lng)

    def test_list_fields_only_own(self):
        Field.objects.create(user=self.user, name='My Field', geometry={'type': 'Point', 'coordinates': [0, 0]})
        Field.objects.create(user=self.user2, name='Not Mine', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get('/api/fields/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'My Field')

    def test_field_detail_own(self):
        field = Field.objects.create(user=self.user, name='My Field', geometry={'type': 'Point', 'coordinates': [0, 0]})
        resp = self.client.get(f'/api/fields/{field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'My Field')

    def test_field_detail_not_own(self):
        field = Field.objects.create(user=self.user2, name='Not Mine', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get(f'/api/fields/{field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 404)

    def test_field_unauthenticated(self):
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 401)

    def test_bbox_filter(self):
        Field.objects.create(
            user=self.user, name='Inside',
            geometry={'type': 'Point', 'coordinates': [5, 5]},
        )
        Field.objects.create(
            user=self.user, name='Outside',
            geometry={'type': 'Point', 'coordinates': [50, 50]},
        )
        resp = self.client.get('/api/fields/?bbox=0,0,10,10', **self.headers)
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Inside')

    def test_geojson_endpoint(self):
        Field.objects.create(
            user=self.user, name='Geo Field',
            geometry={'type': 'Point', 'coordinates': [10, 20]},
        )
        resp = self.client.get('/api/fields/geojson/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['type'], 'FeatureCollection')
        self.assertEqual(len(data['features']), 1)
        feature = data['features'][0]
        self.assertEqual(feature['type'], 'Feature')
        self.assertEqual(feature['geometry'], {'type': 'Point', 'coordinates': [10, 20]})
        self.assertEqual(feature['properties']['name'], 'Geo Field')

    def test_geojson_shares_cooperative_fields(self):
        from farmers.models import Cooperative, CooperativeMember, Farmer
        user2_farmer = Farmer.objects.create(user=self.user2)
        farmer = Farmer.objects.create(user=self.user)
        coop = Cooperative.objects.create(name='Shared Coop', created_by=self.user)
        CooperativeMember.objects.create(cooperative=coop, farmer=farmer, role='admin')
        CooperativeMember.objects.create(cooperative=coop, farmer=user2_farmer, role='member')
        Field.objects.create(
            user=self.user2, name='Shared Field',
            geometry={'type': 'Point', 'coordinates': [15, 25]},
        )
        resp = self.client.get('/api/fields/geojson/', **self.headers)
        self.assertEqual(resp.status_code, 200)
        names = [f['properties']['name'] for f in resp.json()['features']]
        self.assertIn('Shared Field', names)
