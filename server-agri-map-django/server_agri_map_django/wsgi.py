import os

from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'server_agri_map_django.settings.local')

application = get_wsgi_application()
