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
    'average_of_chlorophyll_in_the_plant_achp',
    'plant_height_rate_phr',
    'average_wet_weight_of_the_growth_vegetative_awwgv',
    'average_leaf_area_of_the_plant_alap',
    'average_number_of_plant_leaves_anpl',
    'average_root_diameter_ard',
    'average_dry_weight_of_the_root_adwr',
    'percentage_of_dry_matter_for_vegetative_growth_pdmvg',
    'average_root_length_arl',
    'average_wet_weight_of_the_root_awwr',
    'average_dry_weight_of_vegetative_plants_adwv',
    'percentage_of_dry_matter_for_root_growth_pdmrg',
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
    'average_of_chlorophyll_in_the_plant_achp': 35.0,
    'plant_height_rate_phr': 0.5,
    'average_wet_weight_of_the_growth_vegetative_awwgv': 150.0,
    'average_leaf_area_of_the_plant_alap': 25.0,
    'average_number_of_plant_leaves_anpl': 8.0,
    'average_root_diameter_ard': 2.0,
    'average_dry_weight_of_the_root_adwr': 12.0,
    'percentage_of_dry_matter_for_vegetative_growth_pdmvg': 25.0,
    'average_root_length_arl': 20.0,
    'average_wet_weight_of_the_root_awwr': 45.0,
    'average_dry_weight_of_vegetative_plants_adwv': 30.0,
    'percentage_of_dry_matter_for_root_growth_pdmrg': 20.0,
}

INPUT_FIELDS = [
    'nitrogen', 'phosphorus', 'potassium',
    'temperature', 'humidity', 'rainfall',
    'moisture', 'lon', 'lat',
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
