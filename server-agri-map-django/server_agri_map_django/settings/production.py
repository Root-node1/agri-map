from .base import *

DEBUG = False

INSTALLED_APPS = DJANGO_APPS + [
    'django.contrib.gis',
] + THIRD_PARTY_APPS + PROJECT_APPS

ALLOWED_HOSTS = config(
    'ALLOWED_HOSTS',
    default='agrimap-django.onrender.com',
    cast=Csv(),
)
ALLOWED_HOSTS += ['.onrender.com']

CORS_ALLOWED_ORIGINS = config(
    'CORS_ALLOWED_ORIGINS',
    default='https://agrimap-django.onrender.com,https://agrimap-node.onrender.com',
    cast=Csv(),
)
CORS_ALLOWED_ORIGINS = [
    o if o.startswith('http://') or o.startswith('https://') else f'https://{o}'
    for o in CORS_ALLOWED_ORIGINS
]

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = True
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_BROWSER_XSS_FILTER = True

STORAGES = {
    'staticfiles': {
        'BACKEND': 'whitenoise.storage.CompressedManifestStaticFilesStorage',
    },
}
