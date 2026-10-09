from django.contrib.auth import get_user_model
from django.core.cache import cache
from django.test import TestCase

from fields.models import Field
from soil.models import SoilHealthRecord

User = get_user_model()


class SoilTest(TestCase):
    def setUp(self):
        cache.clear()
        self.user = User.objects.create_user('soiluser', 's@e.com', 'pass')
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )
        SoilHealthRecord.objects.create(field=self.field, nitrogen_proxy=0.62, moisture_index=0.48, degradation_risk='moderate')
        self.client.force_login(self.user)

    def test_soil_health_open(self):
        resp = self.client.get(f'/api/soil/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('nitrogen_proxy', resp.json())
        self.assertIn('moisture_index', resp.json())
        self.assertIn('degradation_risk', resp.json())

    def test_soil_health_no_data(self):
        empty = Field.objects.create(user=self.user, name='Empty', geometry={'type': 'Point', 'coordinates': [1, 1]})
        resp = self.client.get(f'/api/soil/{empty.id}/')
        self.assertEqual(resp.status_code, 404)

    def test_soil_health_missing_field(self):
        resp = self.client.get('/api/soil/9999/')
        self.assertEqual(resp.status_code, 404)
