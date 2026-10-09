"""P2: observability — request IDs + mutation audit log."""
import logging
import time
import uuid

logger = logging.getLogger('agrimap.api')


class RequestIdMiddleware:
    """Attach a request ID (echo client-sent X-Request-ID or generate one)
    and return it on every response for log correlation."""

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        request_id = request.META.get('HTTP_X_REQUEST_ID') or uuid.uuid4().hex
        request.request_id = request_id
        response = self.get_response(request)
        response['X-Request-ID'] = request_id
        return response


class AuditLogMiddleware:
    """One INFO line per mutating /api/* call: who, what, result, latency."""

    MUTATING = {'POST', 'PUT', 'PATCH', 'DELETE'}

    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start = time.perf_counter()
        response = self.get_response(request)
        try:
            if request.path.startswith('/api/') and request.method in self.MUTATING:
                user = getattr(request, 'user', None)
                logger.info(
                    'api_audit method=%s path=%s status=%s user=%s duration_ms=%.1f request_id=%s',
                    request.method,
                    request.path,
                    response.status_code,
                    user.pk if user is not None and user.is_authenticated else 'anon',
                    (time.perf_counter() - start) * 1000,
                    getattr(request, 'request_id', '-'),
                )
        except Exception:
            pass
        return response
