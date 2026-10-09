import os

# base.py evaluates a fail-closed cache guard at import time (LocMemCache +
# DEBUG=False raises). This module means "local dev" (DEBUG=True below), so
# force it into the environment *before* the base import — otherwise an
# exported DEBUG=False (e.g. CI) kills the import before line 3 runs.
# Production is unaffected: it uses settings.production, not this module.
os.environ['DEBUG'] = 'True'

from .base import *

DEBUG = True

ALLOWED_HOSTS = ['localhost', '127.0.0.1', '0.0.0.0']

REST_FRAMEWORK['DEFAULT_RENDERER_CLASSES'] = (
    'rest_framework.renderers.JSONRenderer',
    'rest_framework.renderers.BrowsableAPIRenderer',
)
