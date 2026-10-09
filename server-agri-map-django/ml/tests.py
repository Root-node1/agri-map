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
        self.assertGreater(CONFIDENCE_THRESHOLDS['high'], CONFIDENCE_THRESHOLDS['medium'])

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
        result = predict_crop(field_id=999, temperature=28,
                              humidity=75, nitrogen=50, phosphorus=30,
                              potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('crop_type', result)
        self.assertIn('confidence', result)
        self.assertIn('reliability_level', result)
        self.assertIn('message', result)
        self.assertTrue(0 <= result['confidence'] <= 1)

    def test_predict_crop_persists_for_real_field(self):
        from fields.models import Field
        from ml.services import predict_crop
        user = User.objects.create_user('mluser', 'm@e.com', 'pass')
        field = Field.objects.create(user=user, name='ML field',
                                     geometry={'type': 'Point', 'coordinates': [0, 0]})
        result = predict_crop(field_id=field.id, temperature=28,
                              humidity=75, nitrogen=50, phosphorus=30,
                              potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('crop_type', result)
        self.assertIn(result['reliability_level'], ('High', 'Medium', 'Low'))

    def test_predict_crop_missing_field_returns_result(self):
        from ml.services import predict_crop
        result = predict_crop(field_id=9999, temperature=28)
        self.assertIn('crop_type', result)
        self.assertTrue(0 <= result['confidence'] <= 1)

    def test_predict_crop_area(self):
        from ml.services import predict_crop_area
        result = predict_crop_area(field_id=999, temperature=28,
                                   humidity=75, nitrogen=50, phosphorus=30,
                                   potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('crop_type', result)
        self.assertIn('confidence', result)
        self.assertTrue(0 <= result['confidence'] <= 1)

    def test_predict_soil(self):
        from ml.services import predict_soil
        result = predict_soil(field_id=999, temperature=28,
                              humidity=75, nitrogen=50, phosphorus=30,
                              potassium=40, moisture=40, lon=3.1, lat=43.1)
        self.assertIn('prediction', result)
        self.assertIn('confidence', result)

    def test_reliability_levels(self):
        from ml.services import _get_reliability
        self.assertEqual(_get_reliability(0.99), 'High')
        self.assertEqual(_get_reliability(0.60), 'Medium')
        self.assertEqual(_get_reliability(0.10), 'Low')

    def test_stub_results_flagged_low_with_source(self):
        from ml.services import _stub_result
        for prediction, confidence in (('apple', 0.45), ('Maize', 0.40), ('Loamy', 0.35)):
            result = _stub_result(prediction, confidence)
            self.assertEqual(result['reliability_level'], 'Low')
            self.assertEqual(result['source'], 'stub')

    def test_build_dataframe_clips_direct_calls(self):
        from ml.services import _build_dataframe
        df = _build_dataframe(temperature=9999, humidity=-50, soil_type='x' * 500)
        self.assertEqual(df.loc[0, 'temperature'], 55)
        self.assertEqual(df.loc[0, 'humidity'], 0)
        self.assertLessEqual(len(df.loc[0, 'soil_type']), 100)


class OpenAccessHelperTest(TestCase):
    def test_get_default_user_stable(self):
        from server_agri_map_django.open_access import get_default_user, resolve_user
        u1 = get_default_user()
        u2 = get_default_user()
        self.assertEqual(u1.pk, u2.pk)
        self.assertEqual(u1.username, 'open-access')

    def test_resolve_user_fail_closed_by_default(self):
        from django.test import override_settings
        from server_agri_map_django.open_access import resolve_user
        # Fail-closed: no fallback user unless explicitly enabled.
        self.assertIsNone(resolve_user(None))
        with override_settings(OPEN_ACCESS_FALLBACK=True):
            from server_agri_map_django.open_access import get_default_user
            self.assertEqual(resolve_user(None).pk, get_default_user().pk)

    def test_resolve_user_prefers_authenticated(self):
        from django.contrib.auth import get_user_model
        from server_agri_map_django.open_access import resolve_user
        user = get_user_model().objects.create_user('realuser', 'r@e.com', 'pass')

        class Req:
            pass
        req = Req()
        req.user = user
        self.assertEqual(resolve_user(req).pk, user.pk)
