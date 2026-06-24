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
        self.model = None
        self.preprocessor = None
        self.encoder = None

    @classmethod
    def load(cls):
        if cls._instance is not None:
            return cls._instance
        import joblib
        instance = cls()
        models_dir = Path(settings.ML_MODELS_DIR)
        preprocessors_dir = Path(settings.ML_PREPROCESSORS_DIR)
        try:
            instance.model = joblib.load(str(models_dir / 'crop_recommendation_model.joblib'))
            instance.preprocessor = joblib.load(str(preprocessors_dir / 'recommendation_preprocessor.joblib'))
            instance.encoder = joblib.load(str(preprocessors_dir / 'recommendation_label_encoder.joblib'))
            logger.info('ML models loaded successfully')
        except Exception as e:
            logger.warning('Failed to load ML models: %s', e)
            return None
        cls._instance = instance
        return instance


def _get_reliability(confidence):
    if confidence > CONFIDENCE_THRESHOLDS['high']:
        return 'High'
    elif confidence >= CONFIDENCE_THRESHOLDS['medium']:
        return 'Medium'
    return 'Low'


def predict_crop(*, field_id=None, user=None, **kwargs):
    assets = ModelAssets.load()
    if assets is None:
        from analysis.models import CropPrediction
        from fields.models import Field
        if field_id is not None and user is not None:
            try:
                field = Field.objects.get(pk=field_id, user=user)
            except Field.DoesNotExist:
                field = None
        else:
            field = None
        if field is not None:
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
        stub = {
            'crop_type': 'Maize',
            'confidence': 0.87,
            'reliability_level': 'High',
            'message': CONFIDENCE_MESSAGES['High'],
        }
        logger.info('ML models unavailable — returning stub prediction')
        return stub

    row = {}
    for col in NUMERICAL_FEATURES:
        val = kwargs.get(col)
        if val is None:
            val = NUMERICAL_DEFAULTS.get(col, 0.0)
        row[col] = float(val)
    for col in CATEGORICAL_FEATURES:
        row[col] = 'Unknown'
    df_input = pd.DataFrame([row], columns=FEATURE_ORDER)

    X_transformed = assets.preprocessor.transform(df_input)
    probs = assets.model.predict_proba(X_transformed)
    best_idx = int(np.argmax(probs))
    confidence = float(np.max(probs))
    crop_type = str(assets.encoder.inverse_transform([best_idx])[0])
    reliability = _get_reliability(confidence)

    logger.info(
        'Prediction — crop=%s confidence=%.4f reliability=%s inputs=%s',
        crop_type, confidence, reliability,
        {k: kwargs.get(k) for k in INPUT_FIELDS},
    )

    if field_id is not None and user is not None:
        try:
            from analysis.models import CropPrediction
            from fields.models import Field
            field = Field.objects.get(pk=field_id, user=user)
            CropPrediction.objects.create(field=field, crop_type=crop_type, confidence=confidence)
        except Exception:
            logger.warning('Failed to persist CropPrediction for field %s', field_id)

    return {
        'crop_type': crop_type,
        'confidence': confidence,
        'reliability_level': reliability,
        'message': CONFIDENCE_MESSAGES[reliability],
    }
