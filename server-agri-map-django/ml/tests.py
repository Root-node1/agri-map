from django.contrib.auth import get_user_model
from django.test import TestCase

from ml.schema import CONFIDENCE_MESSAGES, CONFIDENCE_THRESHOLDS, NUMERICAL_DEFAULTS

User = get_user_model()


class MLSchemaTest(TestCase):
    def test_feature_order_constant(self):
        from ml.schema import FEATURE_ORDER
        self.assertIsInstance(FEATURE_ORDER, list)
        self.assertGreater(len(FEATURE_ORDER), 20)
        self.assertIn('nitrogen', FEATURE_ORDER)
        self.assertIn('temperature', FEATURE_ORDER)
        self.assertIn('soil_type', FEATURE_ORDER)
        self.assertIn('region', FEATURE_ORDER)
        self.assertIn('country', FEATURE_ORDER)

    def test_numerical_defaults_all_present(self):
        for key in ['nitrogen', 'phosphorus', 'potassium', 'temperature',
                    'humidity', 'rainfall', 'moisture', 'lon', 'lat']:
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


class MLServiceTest(TestCase):
    def test_predict_crop_no_field(self):
        from ml.services import predict_crop
        result = predict_crop(field_id=999, user=None, humidity=75, rainfall=120,
                              temperature=28, soil_ph=6.5, soil_moisture=40,
                              nitrogen=50, phosphorus=30, potassium=40, elevation=300)
        self.assertIn('crop_type', result)
        self.assertIn('confidence', result)
        self.assertIn('reliability_level', result)
        self.assertIn('message', result)
        self.assertTrue(0 <= result['confidence'] <= 1)

    def test_predict_crop_with_user(self):
        user = User.objects.create_user('mluser', 'm@e.com', 'pass')
        from ml.services import predict_crop
        result = predict_crop(field_id=999, user=user, humidity=75, rainfall=120,
                              temperature=28, soil_ph=6.5, soil_moisture=40,
                              nitrogen=50, phosphorus=30, potassium=40, elevation=300)
        self.assertIn('crop_type', result)
        self.assertIn(result['reliability_level'], ('High', 'Medium', 'Low', 'stub_fallback'))
