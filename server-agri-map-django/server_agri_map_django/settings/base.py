import os
from pathlib import Path

from decouple import Csv, config
from dj_database_url import parse as db_url

BASE_DIR = Path(__file__).resolve().parent.parent.parent

SECRET_KEY = config('SECRET_KEY')
DEBUG = config('DEBUG', default=False, cast=bool)

ALLOWED_HOSTS = config('ALLOWED_HOSTS', default='localhost,127.0.0.1', cast=Csv())

DJANGO_APPS = [
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
]

THIRD_PARTY_APPS = [
    'rest_framework',
    'rest_framework_simplejwt',
    'rest_framework_simplejwt.token_blacklist',
    'corsheaders',
    'django_filters',
    'drf_spectacular',
    'whitenoise.runserver_nostatic',
]

PROJECT_APPS = [
    'accounts',
    'farmers',
    'fields',
    'satellite',
    'analysis',
    'soil',
    'carbon',
    'reports',
    'ml',
]

INSTALLED_APPS = DJANGO_APPS + THIRD_PARTY_APPS + PROJECT_APPS

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
    'django.middleware.security.SecurityMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'server_agri_map_django.observability.RequestIdMiddleware',
    'server_agri_map_django.idempotency.IdempotencyMiddleware',
    'server_agri_map_django.observability.AuditLogMiddleware',
]

ROOT_URLCONF = 'server_agri_map_django.urls'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'server_agri_map_django.wsgi.application'

DATABASES = {
    'default': config(
        'DATABASE_URL',
        default='postgres://postgres:postgres@localhost:5432/agrimap',
        cast=db_url,
    )
}

AUTH_PASSWORD_VALIDATORS = [
    {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'},
]

LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATIC_ROOT = BASE_DIR / 'staticfiles'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='http://localhost:4173,http://localhost:3001,http://localhost:8002,http://localhost:3000',
    cast=Csv(),
)

REDIS_URL = config('REDIS_URL', default='')
if REDIS_URL:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.redis.RedisCache',
            'LOCATION': REDIS_URL,
        }
    }
else:
    CACHES = {
        'default': {
            'BACKEND': 'django.core.cache.backends.locmem.LocMemCache',
            'LOCATION': 'agrimap-idempotency',
        }
    }

if not DEBUG and CACHES['default']['BACKEND'].endswith('LocMemCache'):
    from django.core.exceptions import ImproperlyConfigured
    raise ImproperlyConfigured('Refusing LocMemCache with DEBUG=False: set REDIS_URL.')

# Fail-closed: only fall back to the shared open-access user when
# explicitly enabled (legacy local dev). Production forces False.
OPEN_ACCESS_FALLBACK = config('OPEN_ACCESS_FALLBACK', default=False, cast=bool)

# P2: short TTL for per-user GET caches (seconds).
VIEW_CACHE_SECONDS = config('VIEW_CACHE_SECONDS', default=60, cast=int)
# P1: payload limits — reject oversized bodies before they hit views.
DATA_UPLOAD_MAX_MEMORY_SIZE = config('DATA_UPLOAD_MAX_MEMORY_SIZE', default=2 * 1024 * 1024, cast=int)
DATA_UPLOAD_MAX_NUMBER_OF_FIELDS = config('DATA_UPLOAD_MAX_NUMBER_OF_FIELDS', default=1000, cast=int)
# P1: max GeoJSON coordinate points per Field geometry.
FIELD_GEOMETRY_MAX_POINTS = config('FIELD_GEOMETRY_MAX_POINTS', default=5000, cast=int)

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
        'rest_framework.authentication.SessionAuthentication',
    ),
    'DEFAULT_SCHEMA_CLASS': 'drf_spectacular.openapi.AutoSchema',
    'DEFAULT_PERMISSION_CLASSES': (
        'rest_framework.permissions.IsAuthenticated',
    ),
    'DEFAULT_PAGINATION_CLASS': 'rest_framework.pagination.PageNumberPagination',
    'PAGE_SIZE': 50,
    'DEFAULT_FILTER_BACKENDS': (
        'django_filters.rest_framework.DjangoFilterBackend',
        'rest_framework.filters.OrderingFilter',
        'rest_framework.filters.SearchFilter',
    ),
    'DEFAULT_THROTTLE_CLASSES': (
        'rest_framework.throttling.AnonRateThrottle',
        'rest_framework.throttling.UserRateThrottle',
        'rest_framework.throttling.ScopedRateThrottle',
    ),
    'DEFAULT_THROTTLE_RATES': {
        'anon': config('THROTTLE_ANON', default='100/hour'),
        'user': config('THROTTLE_USER', default='1000/hour'),
        'satellite': config('THROTTLE_SATELLITE', default='30/hour'),
        'ml': config('THROTTLE_ML', default='60/hour'),
        'auth': config('THROTTLE_AUTH', default='20/hour'),
    },
    'EXCEPTION_HANDLER': 'server_agri_map_django.exceptions.consistent_exception_handler',
}

SPECTACULAR_SETTINGS = {
    'TITLE': 'AgriMap API',
    'DESCRIPTION': 'AI-powered agricultural mapping and soil intelligence platform',
    'VERSION': '1.0.0',
    'SERVE_INCLUDE_SCHEMA': False,
}

ML_ASSETS_DIR = BASE_DIR / 'ml' / 'model_assets'

from datetime import timedelta

SIMPLE_JWT = {
    'ACCESS_TOKEN_LIFETIME': timedelta(minutes=config('JWT_ACCESS_MINUTES', default=60, cast=int)),
    'REFRESH_TOKEN_LIFETIME': timedelta(days=config('JWT_REFRESH_DAYS', default=7, cast=int)),
    'ROTATE_REFRESH_TOKENS': True,
    'BLACKLIST_AFTER_ROTATION': True,
}

LOGGING = {
    'version': 1,
    'disable_existing_loggers': False,
    'formatters': {
        'verbose': {
            'format': '{levelname} {asctime} {module} {process:d} {thread:d} {message}',
            'style': '{',
        },
        'simple': {
            'format': '{levelname} {message}',
            'style': '{',
        },
    },
    'handlers': {
        'console': {
            'level': 'INFO',
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        },
    },
    'root': {
        'handlers': ['console'],
        'level': 'INFO',
    },
    'loggers': {
        'django': {
            'handlers': ['console'],
            'level': 'INFO',
            'propagate': False,
        },
        'ml': {
            'handlers': ['console'],
            'level': 'DEBUG',
            'propagate': False,
        },
    },
}
