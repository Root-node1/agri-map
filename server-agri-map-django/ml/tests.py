from django.contrib.auth import get_user_model
from django.test import TestCase

from ml.schema import (
    CONFIDENCE_MESSAGES,
    CONFIDENCE_THRESHOLDS,
    CROP_AREA_CLASSES,
    NUMERICAL_DEFAULTS,
    RECOMMENDATION_CLASSES,
    SOIL_CLASSES,
)

User = get_user_model()


class MLSchemaTest(TestCase):
    def test_feature_order_constant(self):
        from ml.schema import FEATURE_ORDER
        self.assertIsInstance(FEATURE_ORDER, list)
        self.assertGreater(len(FEATURE_ORDER), 10)
        self.assertIn('nitrogen', FEATURE_ORDER)
        self.assertIn('temperature', FEATURE_ORDER)
        self.assertIn('soil_type', FEATURE_ORDER)
        self.assertIn('region', FEATURE_ORDER)
        self.assertIn('country', FEATURE_ORDER)

    def test_numerical_defaults_all_present(self):
        for key in ['nitrogen', 'phosphorus', 'potassium', 'temperature',
                    'humidity', 'moisture', 'lon', 'lat']:
            self.assertIn(key, NUMERICAL_DEFAULTS)
            self.assertIsInstance(NUMERICAL_DEFAULTS[key], (int, float))

    def test_confidence_thresholds_structure(self):
        self.assertIn('high', CONFIDENCE_THRESHOLDS)
        self.assertIn('medium', CONFIDENCE_THRESHOLDS)
        self.assertIsInstance(CONFIDENCE_THRESHOLDS['high'], float)
        self.assertIsInstance(CONFIDENCE_THRESHOLDS['medium'], float)

    def test_confidence_messages_structure(self):
        self.assertIn('High', CONFIDENCE_MESSAGES)
        self.assertIn('Medium', CONFIDENCE_MESSAGES)
        self.assertIn('Low', CONFIDENCE_MESSAGES)

    def test_class_lists(self):
        self.assertEqual(len(RECOMMENDATION_CLASSES), 3)
        self.assertEqual(len(CROP_AREA_CLASSES), 4)
        self.assertEqual(len(SOIL_CLASSES), 3)


class MLServiceTest(TestCase):
    def test_predict_crop_no_field(self):
        from ml.services import predict_crop
        result = predict_crop(field_id=999, user=None, temperature=28,
                              humidity=75, nitrogen=50, phosphorus=30,
                              potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('crop_type', result)
        self.assertIn('confidence', result)
        self.assertIn('reliability_level', result)
        self.assertIn('message', result)
        self.assertTrue(0 <= result['confidence'] <= 1)

    def test_predict_crop_with_user(self):
        user = User.objects.create_user('mluser', 'm@e.com', 'pass')
        from ml.services import predict_crop
        result = predict_crop(field_id=999, user=user, temperature=28,
                              humidity=75, nitrogen=50, phosphorus=30,
                              potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('crop_type', result)
        self.assertIn(result['reliability_level'], ('High', 'Medium', 'Low'))

    def test_predict_crop_area(self):
        from ml.services import predict_crop_area
        result = predict_crop_area(field_id=999, user=None, temperature=28,
                                   humidity=75, nitrogen=50, phosphorus=30,
                                   potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('crop_type', result)
        self.assertIn('confidence', result)
        self.assertTrue(0 <= result['confidence'] <= 1)

    def test_predict_soil(self):
        from ml.services import predict_soil
        result = predict_soil(field_id=999, user=None, temperature=28,
                              humidity=75, nitrogen=50, phosphorus=30,
                              potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('prediction', result)
        self.assertIn('confidence', result)
