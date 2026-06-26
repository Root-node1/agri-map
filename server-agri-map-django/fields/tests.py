from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
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

    def test_centroid_linestring(self):
        field = Field.objects.create(
            user=User.objects.create_user('u4', 'u4@e.com', 'pass'),
            name='Line Field',
            geometry={'type': 'LineString', 'coordinates': [[0, 0], [10, 10]]},
        )
        self.assertAlmostEqual(field.centroid_lat, 5.0)
        self.assertAlmostEqual(field.centroid_lng, 5.0)

    def test_geometry_validation_valid(self):
        field = Field(
            user=User.objects.create_user('u5', 'u5@e.com', 'pass'),
            name='Valid Field',
            geometry={'type': 'Polygon', 'coordinates': [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
        )
        field.full_clean()

    def test_geometry_validation_invalid_type(self):
        with self.assertRaises(ValidationError):
            field = Field(
                user=User.objects.create_user('u6', 'u6@e.com', 'pass'),
                name='Bad Field',
                geometry={'type': 'InvalidType', 'coordinates': []},
            )
            field.full_clean()

    def test_geometry_validation_missing_coordinates(self):
        with self.assertRaises(ValidationError):
            field = Field(
                user=User.objects.create_user('u7', 'u7@e.com', 'pass'),
                name='No Coords',
                geometry={'type': 'Point'},
            )
            field.full_clean()

    def test_geometry_validation_not_dict(self):
        with self.assertRaises(ValidationError):
            field = Field(
                user=User.objects.create_user('u8', 'u8@e.com', 'pass'),
                name='Not dict',
                geometry='not geojson',
            )
            field.full_clean()


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

    def test_update_field(self):
        field = Field.objects.create(
            user=self.user, name='Old Name',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        resp = self.client.patch(f'/api/fields/{field.id}/', {
            'name': 'Updated Name',
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Updated Name')
        field.refresh_from_db()
        self.assertEqual(field.name, 'Updated Name')

    def test_delete_field(self):
        field = Field.objects.create(
            user=self.user, name='To Delete',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        resp = self.client.delete(f'/api/fields/{field.id}/', **self.headers)
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Field.objects.count(), 0)

    def test_bbox_invalid_format(self):
        resp = self.client.get('/api/fields/?bbox=not,a,bbox', **self.headers)
        self.assertEqual(resp.status_code, 400)

    def test_bbox_wrong_part_count(self):
        resp = self.client.get('/api/fields/?bbox=1,2,3', **self.headers)
        self.assertEqual(resp.status_code, 400)

    def test_invalid_geometry_rejected(self):
        resp = self.client.post('/api/fields/', {
            'name': 'Bad',
            'geometry': {'type': 'Invalid', 'coordinates': []},
        }, **self.headers, content_type='application/json')
        self.assertEqual(resp.status_code, 400)
