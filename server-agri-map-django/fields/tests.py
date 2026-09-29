from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.test import TestCase

from .models import Field

User = get_user_model()


def make_user(username='u'):
    return User.objects.create_user(username, f'{username}@e.com', 'pass')


class FieldModelTest(TestCase):
    def test_centroid_point(self):
        field = Field.objects.create(
            user=make_user('u1'),
            name='Point Field',
            geometry={'type': 'Point', 'coordinates': [30.5, 50.2]},
        )
        self.assertAlmostEqual(field.centroid_lat, 50.2)
        self.assertAlmostEqual(field.centroid_lng, 30.5)

    def test_centroid_polygon(self):
        field = Field.objects.create(
            user=make_user('u2'),
            name='Poly Field',
            geometry={'type': 'Polygon', 'coordinates': [[[0, 0], [0, 10], [10, 10], [10, 0], [0, 0]]]},
        )
        self.assertAlmostEqual(field.centroid_lat, 5.0)
        self.assertAlmostEqual(field.centroid_lng, 5.0)

    def test_centroid_multipolygon(self):
        field = Field.objects.create(
            user=make_user('u3'),
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
            user=make_user('u4'),
            name='Line Field',
            geometry={'type': 'LineString', 'coordinates': [[0, 0], [10, 10]]},
        )
        self.assertAlmostEqual(field.centroid_lat, 5.0)
        self.assertAlmostEqual(field.centroid_lng, 5.0)

    def test_centroid_multipoint(self):
        field = Field.objects.create(
            user=make_user('u4b'),
            name='MultiPoint Field',
            geometry={'type': 'MultiPoint', 'coordinates': [[0, 0], [10, 10]]},
        )
        self.assertAlmostEqual(field.centroid_lat, 5.0)
        self.assertAlmostEqual(field.centroid_lng, 5.0)

    def test_centroid_multilinestring(self):
        field = Field.objects.create(
            user=make_user('u4c'),
            name='MultiLine Field',
            geometry={'type': 'MultiLineString', 'coordinates': [[[0, 0], [2, 2]], [[4, 4], [6, 6]]]},
        )
        self.assertAlmostEqual(field.centroid_lat, 3.0)
        self.assertAlmostEqual(field.centroid_lng, 3.0)

    def test_geometry_validation_valid(self):
        field = Field(
            user=make_user('u5'),
            name='Valid Field',
            geometry={'type': 'Polygon', 'coordinates': [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
        )
        field.full_clean()

    def test_geometry_validation_invalid_type(self):
        with self.assertRaises(ValidationError):
            field = Field(
                user=make_user('u6'),
                name='Bad Field',
                geometry={'type': 'InvalidType', 'coordinates': []},
            )
            field.full_clean()

    def test_geometry_validation_missing_coordinates(self):
        with self.assertRaises(ValidationError):
            field = Field(
                user=make_user('u7'),
                name='No Coords',
                geometry={'type': 'Point'},
            )
            field.full_clean()

    def test_geometry_validation_not_dict(self):
        with self.assertRaises(ValidationError):
            field = Field(
                user=make_user('u8'),
                name='Not dict',
                geometry='not geojson',
            )
            field.full_clean()

    def test_str(self):
        field = Field(user=make_user('u9'), name='Named', geometry={'type': 'Point', 'coordinates': [0, 0]})
        self.assertEqual(str(field), 'Named')


class FieldAPITest(TestCase):
    def setUp(self):
        self.user = make_user('fieldowner')
        self.user2 = make_user('other')

    def _create(self, name='North Field', **extra):
        payload = {
            'name': name,
            'geometry': {'type': 'Polygon', 'coordinates': [[[0, 0], [0, 1], [1, 1], [1, 0], [0, 0]]]},
            'area_ha': 10.5,
        }
        payload.update(extra)
        return self.client.post('/api/fields/', payload, content_type='application/json')

    def test_create_field_no_auth(self):
        resp = self._create()
        self.assertEqual(resp.status_code, 201)
        self.assertEqual(Field.objects.count(), 1)
        field = Field.objects.first()
        self.assertIsNotNone(field.centroid_lat)
        self.assertIsNotNone(field.centroid_lng)
        self.assertIsNotNone(field.user)

    def test_create_field_missing_name(self):
        resp = self.client.post('/api/fields/', {
            'geometry': {'type': 'Point', 'coordinates': [0, 0]},
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)

    def test_list_fields_shows_all_users(self):
        Field.objects.create(user=self.user, name='Mine', geometry={'type': 'Point', 'coordinates': [0, 0]})
        Field.objects.create(user=self.user2, name='Theirs', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get('/api/fields/')
        self.assertEqual(resp.status_code, 200)
        names = {r['name'] for r in resp.json()['results']}
        self.assertEqual(names, {'Mine', 'Theirs'})

    def test_field_detail_any_owner(self):
        field = Field.objects.create(user=self.user2, name='Theirs', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get(f'/api/fields/{field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Theirs')

    def test_field_detail_missing(self):
        resp = self.client.get('/api/fields/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_bbox_filter(self):
        Field.objects.create(user=self.user, name='Inside', geometry={'type': 'Point', 'coordinates': [5, 5]})
        Field.objects.create(user=self.user, name='Outside', geometry={'type': 'Point', 'coordinates': [50, 50]})
        resp = self.client.get('/api/fields/?bbox=0,0,10,10')
        self.assertEqual(resp.status_code, 200)
        results = resp.json()['results']
        self.assertEqual(len(results), 1)
        self.assertEqual(results[0]['name'], 'Inside')

    def test_bbox_filter_outside_returns_empty(self):
        Field.objects.create(user=self.user, name='Inside', geometry={'type': 'Point', 'coordinates': [5, 5]})
        resp = self.client.get('/api/fields/?bbox=40,40,60,60')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['results'], [])

    def test_geojson_endpoint(self):
        Field.objects.create(user=self.user, name='Geo Field', geometry={'type': 'Point', 'coordinates': [10, 20]})
        resp = self.client.get('/api/fields/geojson/')
        self.assertEqual(resp.status_code, 200)
        data = resp.json()
        self.assertEqual(data['type'], 'FeatureCollection')
        self.assertEqual(len(data['features']), 1)
        feature = data['features'][0]
        self.assertEqual(feature['type'], 'Feature')
        self.assertEqual(feature['geometry'], {'type': 'Point', 'coordinates': [10, 20]})
        self.assertEqual(feature['properties']['name'], 'Geo Field')

    def test_update_field(self):
        field = Field.objects.create(user=self.user, name='Old Name', geometry={'type': 'Point', 'coordinates': [0, 0]})
        resp = self.client.patch(f'/api/fields/{field.id}/', {'name': 'Updated Name'}, content_type='application/json')
        self.assertEqual(resp.status_code, 200)
        self.assertEqual(resp.json()['name'], 'Updated Name')
        field.refresh_from_db()
        self.assertEqual(field.name, 'Updated Name')

    def test_update_field_missing(self):
        resp = self.client.patch('/api/fields/9999/', {'name': 'X'}, content_type='application/json')
        self.assertEqual(resp.status_code, 404)

    def test_delete_field(self):
        field = Field.objects.create(user=self.user, name='To Delete', geometry={'type': 'Point', 'coordinates': [0, 0]})
        resp = self.client.delete(f'/api/fields/{field.id}/')
        self.assertEqual(resp.status_code, 204)
        self.assertEqual(Field.objects.count(), 0)

    def test_delete_field_missing(self):
        resp = self.client.delete('/api/fields/9999/')
        self.assertEqual(resp.status_code, 404)

    def test_bbox_invalid_format(self):
        resp = self.client.get('/api/fields/?bbox=not,a,bbox')
        self.assertEqual(resp.status_code, 400)

    def test_bbox_wrong_part_count(self):
        resp = self.client.get('/api/fields/?bbox=1,2,3')
        self.assertEqual(resp.status_code, 400)

    def test_bbox_non_numeric(self):
        resp = self.client.get('/api/fields/?bbox=a,b,c,d')
        self.assertEqual(resp.status_code, 400)

    def test_invalid_geometry_rejected(self):
        resp = self.client.post('/api/fields/', {
            'name': 'Bad',
            'geometry': {'type': 'Invalid', 'coordinates': []},
        }, content_type='application/json')
        self.assertEqual(resp.status_code, 400)
