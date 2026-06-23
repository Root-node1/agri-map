#!/usr/bin/env bash
set -eo pipefail

python manage.py migrate --noinput
python manage.py collectstatic --noinput --clear

exec gunicorn server_agri_map_django.wsgi:application \
  --bind "0.0.0.0:${PORT:-8002}" \
  --workers "${GUNICORN_WORKERS:-4}" \
  --access-logfile - \
  --error-logfile -
