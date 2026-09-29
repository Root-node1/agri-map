from django.contrib.auth import get_user_model
from django.test import TestCase

from analysis.models import CropPrediction
from carbon.models import CarbonSequestration
from fields.models import Field
from soil.models import SoilHealthRecord

User = get_user_model()


class ReportTest(TestCase):
    def setUp(self):
        self.user = User.objects.create_user('repuser', 'r@e.com', 'pass')
        self.field = Field.objects.create(
            user=self.user, name='Test Field',
            geometry={'type': 'Point', 'coordinates': [0, 0]},
        )

    def test_report_generation_open(self):
        resp = self.client.get(f'/api/reports/field/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIn('field_id', resp.json())
        self.assertEqual(resp.json()['field_name'], 'Test Field')

    def test_report_with_data(self):
        CropPrediction.objects.create(field=self.field, crop_type='Maize', confidence=0.92)
        SoilHealthRecord.objects.create(field=self.field, nitrogen_proxy=0.5, moisture_index=0.5, degradation_risk='low')
        CarbonSequestration.objects.create(field=self.field, carbon_tons=1.2, confidence_score=0.8, methodology='ndvi_based')
        resp = self.client.get(f'/api/reports/field/{self.field.id}/')
        self.assertEqual(resp.status_code, 200)
        self.assertIsNotNone(resp.json().get('crop'))
        self.assertIsNotNone(resp.json().get('soil'))
        self.assertIsNotNone(resp.json().get('carbon'))

    def test_report_missing_field(self):
        resp = self.client.get('/api/reports/field/9999/')
        self.assertEqual(resp.status_code, 404)
