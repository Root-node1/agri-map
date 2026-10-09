"""P0: Idempotency-Key support for unsafe POST endpoints.

Usage (client): send `Idempotency-Key: <uuid>` header with POST.
Replay with the same key + same authenticated user + same path returns
the original response with `X-Idempotent-Replayed: true` instead of
creating a duplicate resource. Keys expire after 24h.

Implemented as middleware on top of the Django cache (LocMem by default,
swap to Redis in production via CACHES) so no migration is required and
it applies uniformly to all POST endpoints.
"""
import json

from django.core.cache import cache
from django.http import JsonResponse

IDEMPOTENCY_HEADER = 'HTTP_IDEMPOTENCY_KEY'
TTL_SECONDS = 24 * 60 * 60
MAX_BODY_BYTES = 1024 * 1024


def _cache_key(user_pk, path, idem_key: str) -> str:
    return f'idem:{user_pk or "anon"}:{path}:{idem_key}'


class IdempotencyMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        idem_key = request.META.get(IDEMPOTENCY_HEADER, '')
        if request.method != 'POST' or not idem_key or not request.path.startswith('/api/'):
            return self.get_response(request)

        if len(idem_key) > 255 or len(request.body) > MAX_BODY_BYTES:
            return self.get_response(request)

        user_pk = request.user.pk if getattr(request, 'user', None) and request.user.is_authenticated else None
        key = _cache_key(user_pk, request.path, idem_key)
        cached = cache.get(key)
        if cached is not None:
            resp = JsonResponse(cached['data'], status=cached['status'])
            resp['X-Idempotent-Replayed'] = 'true'
            return resp

        response = self.get_response(request)

        # Only cache successful JSON creations / mutations.
        content_type = response.get('Content-Type', '')
        if response.status_code in (200, 201) and content_type.startswith('application/json'):
            try:
                data = json.loads(response.content.decode('utf-8'))
                cache.set(key, {'data': data, 'status': response.status_code}, TTL_SECONDS)
                response['Idempotency-Key'] = idem_key
            except (ValueError, UnicodeDecodeError):
                pass
        return response
