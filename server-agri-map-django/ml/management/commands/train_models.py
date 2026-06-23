import logging
from pathlib import Path

import numpy as np
import pandas as pd
from django.conf import settings
from django.core.management.base import BaseCommand
from sklearn.ensemble import RandomForestClassifier
from sklearn.compose import ColumnTransformer
from sklearn.preprocessing import OneHotEncoder, StandardScaler

from ml.schema import CATEGORICAL_FEATURES, FEATURE_ORDER, NUMERICAL_FEATURES

logger = logging.getLogger(__name__)

CROPS = [
    'Rice', 'Maize', 'Wheat', 'Barley', 'Sorghum',
    'Millet', 'Soybean', 'Groundnut', 'Cotton', 'Coffee',
]

CROP_DISTRIBUTIONS = {
    'Rice': {
        'nitrogen': (60, 100), 'phosphorus': (30, 55), 'potassium': (30, 55),
        'temperature': (22, 35), 'humidity': (75, 92), 'rainfall': (150, 300),
        'moisture': (50, 80), 'lon': (0, 40), 'lat': (-10, 30),
    },
    'Maize': {
        'nitrogen': (80, 150), 'phosphorus': (30, 65), 'potassium': (30, 65),
        'temperature': (18, 30), 'humidity': (50, 75), 'rainfall': (80, 200),
        'moisture': (35, 60), 'lon': (-120, 60), 'lat': (-35, 50),
    },
    'Wheat': {
        'nitrogen': (60, 120), 'phosphorus': (25, 55), 'potassium': (25, 55),
        'temperature': (10, 25), 'humidity': (40, 65), 'rainfall': (40, 120),
        'moisture': (25, 50), 'lon': (-120, 80), 'lat': (25, 60),
    },
    'Barley': {
        'nitrogen': (40, 90), 'phosphorus': (20, 45), 'potassium': (20, 45),
        'temperature': (8, 22), 'humidity': (35, 60), 'rainfall': (30, 100),
        'moisture': (20, 45), 'lon': (-10, 60), 'lat': (30, 65),
    },
    'Sorghum': {
        'nitrogen': (40, 90), 'phosphorus': (15, 40), 'potassium': (20, 50),
        'temperature': (22, 38), 'humidity': (30, 60), 'rainfall': (30, 120),
        'moisture': (20, 45), 'lon': (-100, 50), 'lat': (-20, 40),
    },
    'Millet': {
        'nitrogen': (25, 70), 'phosphorus': (10, 35), 'potassium': (15, 40),
        'temperature': (20, 40), 'humidity': (20, 50), 'rainfall': (20, 80),
        'moisture': (15, 35), 'lon': (-20, 60), 'lat': (-10, 45),
    },
    'Soybean': {
        'nitrogen': (10, 40), 'phosphorus': (30, 70), 'potassium': (30, 70),
        'temperature': (18, 32), 'humidity': (55, 80), 'rainfall': (80, 180),
        'moisture': (30, 60), 'lon': (-100, 50), 'lat': (0, 50),
    },
    'Groundnut': {
        'nitrogen': (10, 35), 'phosphorus': (35, 75), 'potassium': (25, 60),
        'temperature': (20, 35), 'humidity': (50, 75), 'rainfall': (50, 150),
        'moisture': (25, 50), 'lon': (-20, 30), 'lat': (-30, 30),
    },
    'Cotton': {
        'nitrogen': (70, 140), 'phosphorus': (25, 55), 'potassium': (40, 80),
        'temperature': (20, 38), 'humidity': (40, 70), 'rainfall': (60, 150),
        'moisture': (25, 50), 'lon': (-120, 80), 'lat': (0, 40),
    },
    'Coffee': {
        'nitrogen': (80, 160), 'phosphorus': (20, 50), 'potassium': (40, 80),
        'temperature': (15, 28), 'humidity': (65, 90), 'rainfall': (120, 250),
        'moisture': (40, 70), 'lon': (-80, 50), 'lat': (-25, 25),
    },
}

SOIL_TYPES = ['Clay', 'Loam', 'Sandy', 'Silt', 'Peaty']
REGIONS = ['East Africa', 'West Africa', 'South Asia', 'Southeast Asia', 'South America', 'North America', 'Europe']
COUNTRIES = ['Kenya', 'Nigeria', 'India', 'Indonesia', 'Brazil', 'USA', 'France']

NUM_ROWS = 2000
RANDOM_STATE = 42


def _sample_range(rng, low, high):
    return rng.uniform(low, high)


class Command(BaseCommand):
    help = 'Train the crop recommendation model on synthetic agricultural data and export .joblib files'

    def handle(self, *args, **options):
        rng = np.random.default_rng(RANDOM_STATE)
        rows = []
        labels = []

        for _ in range(NUM_ROWS):
            crop = CROPS[rng.integers(0, len(CROPS))]
            dist = CROP_DISTRIBUTIONS[crop]
            row = {}
            for feat in NUMERICAL_FEATURES:
                if feat in dist:
                    low, high = dist[feat]
                    row[feat] = round(_sample_range(rng, low, high), 4)
                else:
                    # Zero-centered noise for auxiliary plant traits — non-informative
                    row[feat] = round(rng.normal(0, 0.01), 4)
            row['soil_type'] = SOIL_TYPES[rng.integers(0, len(SOIL_TYPES))]
            row['region'] = REGIONS[rng.integers(0, len(REGIONS))]
            row['country'] = COUNTRIES[rng.integers(0, len(COUNTRIES))]
            rows.append(row)
            labels.append(crop)

        df = pd.DataFrame(rows, columns=FEATURE_ORDER)
        y = np.array(labels)

        preprocessor = ColumnTransformer(
            transformers=[
                ('num', StandardScaler(), NUMERICAL_FEATURES),
                ('cat', OneHotEncoder(handle_unknown='ignore', sparse_output=False), CATEGORICAL_FEATURES),
            ],
            remainder='drop',
        )

        from sklearn.preprocessing import LabelEncoder
        encoder = LabelEncoder()
        y_encoded = encoder.fit_transform(y)

        X_transformed = preprocessor.fit_transform(df)

        model = RandomForestClassifier(n_estimators=150, random_state=RANDOM_STATE)
        model.fit(X_transformed, y_encoded)

        import joblib
        models_dir = Path(settings.ML_MODELS_DIR)
        preprocessors_dir = Path(settings.ML_PREPROCESSORS_DIR)
        models_dir.mkdir(parents=True, exist_ok=True)
        preprocessors_dir.mkdir(parents=True, exist_ok=True)

        joblib.dump(model, str(models_dir / 'crop_recommendation_model.joblib'))
        joblib.dump(preprocessor, str(preprocessors_dir / 'recommendation_preprocessor.joblib'))
        joblib.dump(encoder, str(preprocessors_dir / 'recommendation_label_encoder.joblib'))

        y_pred = model.predict(X_transformed)
        accuracy = float(np.mean(y_pred == y_encoded))
        self.stdout.write(self.style.SUCCESS(f'Trained model accuracy: {accuracy:.4f}'))
        self.stdout.write(self.style.SUCCESS(
            f'Exported: {models_dir / "crop_recommendation_model.joblib"}, '
            f'{preprocessors_dir / "recommendation_preprocessor.joblib"}, '
            f'{preprocessors_dir / "recommendation_label_encoder.joblib"}'
        ))
