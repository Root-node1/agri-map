import logging
from pathlib import Path

import numpy as np
import pandas as pd
from django.conf import settings

from .schema import (
    CATEGORICAL_FEATURES,
    CONFIDENCE_MESSAGES,
    CONFIDENCE_THRESHOLDS,
    FEATURE_ORDER,
    INPUT_FIELDS,
    NUMERICAL_DEFAULTS,
    NUMERICAL_FEATURES,
)

logger = logging.getLogger(__name__)


class ModelAssets:
    _instance = None

    def __init__(self):
        self.rec_model = None
        self.rec_preprocessor = None
        self.rec_encoder = None
        self.area_model = None
        self.area_preprocessor = None
        self.area_encoder = None
        self.soil_scaler = None
        self.soil_encoder = None

    @classmethod
    def load(cls):
        if cls._instance is not None:
            return cls._instance
        import joblib
        instance = cls()
        assets_dir = Path(settings.ML_ASSETS_DIR)
        try:
            instance.rec_model = joblib.load(str(assets_dir / 'crop_recommendation_model.joblib'))
            instance.rec_preprocessor = joblib.load(str(assets_dir / 'recommendation_preprocessor.joblib'))
            instance.rec_encoder = joblib.load(str(assets_dir / 'recommendation_label_encoder.joblib'))
            logger.info('Crop recommendation model loaded')
        except Exception as e:
            logger.warning('Failed to load recommendation model: %s', e)
        try:
            instance.area_model = joblib.load(str(assets_dir / 'crop_area_model.joblib'))
            instance.area_preprocessor = joblib.load(str(assets_dir / 'crop_area_preprocessor.joblib'))
            instance.area_encoder = joblib.load(str(assets_dir / 'crop_area_label_encoder.joblib'))
            logger.info('Crop area model loaded')
        except Exception as e:
            logger.warning('Failed to load crop area model: %s', e)
        try:
            instance.soil_scaler = joblib.load(str(assets_dir / 'soil_scaler.joblib'))
            instance.soil_encoder = joblib.load(str(assets_dir / 'soil_label_encoder.joblib'))
            logger.info('Soil model assets loaded (no model file)')
        except Exception as e:
            logger.warning('Failed to load soil assets: %s', e)
        cls._instance = instance
        return instance


def _get_reliability(confidence):
    if confidence > CONFIDENCE_THRESHOLDS['high']:
        return 'High'
    elif confidence >= CONFIDENCE_THRESHOLDS['medium']:
        return 'Medium'
    return 'Low'


def _build_dataframe(**kwargs):
    row = {}
    for col in NUMERICAL_FEATURES:
        val = kwargs.get(col)
        if val is None:
            val = NUMERICAL_DEFAULTS.get(col, 0.0)
        row[col] = float(val)
    for col in CATEGORICAL_FEATURES:
        val = kwargs.get(col)
        row[col] = val if val else 'Unknown'
    return pd.DataFrame([row], columns=FEATURE_ORDER)


def _stub_result(prediction, confidence):
    reliability = _get_reliability(confidence)
    return {
        'prediction': prediction,
        'confidence': confidence,
        'reliability_level': reliability,
        'message': CONFIDENCE_MESSAGES[reliability],
    }


def predict_crop(*, field_id=None, user=None, **kwargs):
    assets = ModelAssets.load()
    if assets.rec_model is None:
        from analysis.models import CropPrediction
        from fields.models import Field
        if field_id is not None and user is not None:
            try:
                field = Field.objects.get(pk=field_id, user=user)
                existing = CropPrediction.objects.filter(field=field).first()
                if existing:
                    return {
                        'field_id': field.id,
                        'crop_type': existing.crop_type,
                        'confidence': existing.confidence,
                        'predicted_at': existing.predicted_at,
                        'reliability_level': _get_reliability(existing.confidence),
                        'message': CONFIDENCE_MESSAGES[_get_reliability(existing.confidence)],
                    }
            except Field.DoesNotExist:
                pass
        stub = _stub_result('apple', 0.85)
        logger.info('Recommendation model unavailable — returning stub')
        return stub

    df_input = _build_dataframe(**kwargs)
    X_transformed = assets.rec_preprocessor.transform(df_input)
    probs = assets.rec_model.predict_proba(X_transformed)
    best_idx = int(np.argmax(probs))
    confidence = float(np.max(probs))
    crop_type = str(assets.rec_encoder.inverse_transform([best_idx])[0])
    reliability = _get_reliability(confidence)

    logger.info(
        'Prediction — crop=%s confidence=%.4f reliability=%s inputs=%s',
        crop_type, confidence, reliability,
        {k: kwargs.get(k) for k in INPUT_FIELDS},
    )

    saved_field_id = None
    if field_id is not None and user is not None:
        try:
            from analysis.models import CropPrediction
            from fields.models import Field
            field = Field.objects.get(pk=field_id, user=user)
            CropPrediction.objects.create(field=field, crop_type=crop_type, confidence=confidence)
            saved_field_id = field.id
        except Exception:
            logger.warning('Failed to persist CropPrediction for field %s', field_id)

    return {
        'field_id': saved_field_id,
        'crop_type': crop_type,
        'confidence': confidence,
        'reliability_level': reliability,
        'message': CONFIDENCE_MESSAGES[reliability],
    }


def predict_crop_area(*, field_id=None, user=None, **kwargs):
    assets = ModelAssets.load()
    if assets.area_model is None:
        stub = _stub_result('Maize', 0.70)
        logger.info('Crop area model unavailable — returning stub')
        return stub

    df_input = _build_dataframe(**kwargs)
    X_transformed = assets.area_preprocessor.transform(df_input)
    probs = assets.area_model.predict_proba(X_transformed)
    best_idx = int(np.argmax(probs))
    confidence = float(np.max(probs))
    crop_type = str(assets.area_encoder.inverse_transform([best_idx])[0])
    reliability = _get_reliability(confidence)

    logger.info(
        'CropArea — crop=%s confidence=%.4f reliability=%s',
        crop_type, confidence, reliability,
    )

    saved_field_id = None
    if field_id is not None and user is not None:
        try:
            from analysis.models import CropAreaPrediction
            from fields.models import Field
            field = Field.objects.get(pk=field_id, user=user)
            CropAreaPrediction.objects.create(field=field, crop_type=crop_type, confidence=confidence)
            saved_field_id = field.id
        except Exception:
            logger.warning('Failed to persist CropAreaPrediction for field %s', field_id)

    return {
        'field_id': saved_field_id,
        'crop_type': crop_type,
        'confidence': confidence,
        'reliability_level': reliability,
        'message': CONFIDENCE_MESSAGES[reliability],
    }


def predict_soil(*, field_id=None, user=None, **kwargs):
    assets = ModelAssets.load()
    stub = _stub_result('Loamy', 0.60)
    stub['note'] = 'Soil model not yet trained — returning estimate'
    logger.info('Soil model unavailable — returning stub')
    return stub
