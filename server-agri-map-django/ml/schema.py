NUMERICAL_FEATURES = [
    'nitrogen',
    'phosphorus',
    'potassium',
    'temperature',
    'humidity',
    'rainfall',
    'moisture',
    'lon',
    'lat',
    'geouncertaintyinm',
    'areainm2',
]

CATEGORICAL_FEATURES = ['soil_type', 'region', 'country']

FEATURE_ORDER = NUMERICAL_FEATURES + CATEGORICAL_FEATURES

NUMERICAL_DEFAULTS = {
    'nitrogen': 80.0,
    'phosphorus': 40.0,
    'potassium': 40.0,
    'temperature': 25.0,
    'humidity': 70.0,
    'rainfall': 200.0,
    'moisture': 40.0,
    'lon': 3.1,
    'lat': 43.1,
    'geouncertaintyinm': 5.0,
    'areainm2': 10000.0,
}

INPUT_FIELDS = [
    'nitrogen', 'phosphorus', 'potassium',
    'temperature', 'humidity', 'rainfall',
    'moisture', 'lon', 'lat',
]

RECOMMENDATION_CLASSES = [
    'apple', 'banana', 'blackgram',
]

CROP_AREA_CLASSES = [
    'Barley', 'Maize', 'Rice', 'Wheat',
]

SOIL_CLASSES = [
    'Clayey', 'Loamy', 'Sandy',
]

CONFIDENCE_THRESHOLDS = {
    'high': 0.85,
    'medium': 0.60,
}

CONFIDENCE_MESSAGES = {
    'High': 'Optimal conditions detected for this crop. Verified for planting.',
    'Medium': 'Conditions are acceptable. This is an experimental recommendation.',
    'Low': 'Conditions variable; consult local soil tests before planting.',
}
