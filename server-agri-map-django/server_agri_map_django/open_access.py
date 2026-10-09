from django.conf import settings
from django.contrib.auth import get_user_model

OPEN_ACCESS_USERNAME = 'open-access'


def get_default_user():
    User = get_user_model()
    user, _ = User.objects.get_or_create(
        username=OPEN_ACCESS_USERNAME,
        defaults={'email': 'open-access@example.com'},
    )
    return user


def resolve_user(request):
    """P0: prefer the authenticated user; fall back to the shared
    open-access user only when OPEN_ACCESS_FALLBACK=True (dev/legacy)."""
    user = getattr(request, 'user', None)
    if user is not None and user.is_authenticated:
        return user
    if getattr(settings, 'OPEN_ACCESS_FALLBACK', False):
        return get_default_user()
    return user
