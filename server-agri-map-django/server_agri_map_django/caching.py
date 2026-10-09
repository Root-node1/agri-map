"""P2: safe per-user caching for expensive read endpoints.

Uses the Django cache (LocMem by default, Redis in production). The key
includes the user id + full path (with query string), so one user can
never read another user's cached response. Short TTL (60s default) keeps
staleness bounded; POST-driven changes converge within one TTL window.
"""
import copy
import hashlib
from functools import wraps

from django.conf import settings
from rest_framework.response import Response


def _cache_ttl() -> int:
    return int(getattr(settings, 'VIEW_CACHE_SECONDS', 60))


def _user_part(request) -> str:
    user = getattr(request, 'user', None)
    if user is not None and user.is_authenticated:
        return str(user.pk)
    return 'anon'


def _cache_version(user_part: str) -> int:
    from django.core.cache import cache
    try:
        return int(cache.get(f'vcver:{user_part}', 1))
    except (TypeError, ValueError):
        return 1


def bump_user_viewcache(user) -> None:
    """Invalidate a user's cached GETs after a mutation (version bump —
    works on backends without pattern-delete)."""
    from django.core.cache import cache
    user_part = str(getattr(user, 'pk', 'anon'))
    try:
        cache.set(f'vcver:{user_part}', _cache_version(user_part) + 1)
    except Exception:
        pass


def _cache_key(request) -> str:
    user_part = _user_part(request)
    raw = f'viewcache:v{_cache_version(user_part)}:{user_part}:{request.get_full_path()}'
    return 'vc:' + hashlib.sha256(raw.encode()).hexdigest()


def cached_get_view(timeout=None):
    """Cache a DRF APIView.get Response (200s only) per user+URL."""
    def decorator(get_fn):
        @wraps(get_fn)
        def wrapper(self, request, *args, **kwargs):
            from django.core.cache import cache

            ttl = timeout or _cache_ttl()
            key = _cache_key(request)
            hit = cache.get(key)
            if hit is not None:
                resp = Response(hit['data'], status=hit['status'])
                resp['X-Cache'] = 'HIT'
                resp['Cache-Control'] = f'private, max-age={ttl}'
                return resp

            resp = get_fn(self, request, *args, **kwargs)
            if resp.status_code == 200:
                try:
                    cache.set(
                        key,
                        {'data': copy.deepcopy(resp.data), 'status': resp.status_code},
                        ttl,
                    )
                    resp['X-Cache'] = 'MISS'
                    resp['Cache-Control'] = f'private, max-age={ttl}'
                except Exception:
                    pass
            return resp
        return wrapper
    return decorator
