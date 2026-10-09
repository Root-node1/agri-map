"""P0: consistent error envelope for the API.

Success bodies are untouched. All error responses become:
  {"error": "<human message>", "code": "<machine code>", "details": {...}}

This keeps the legacy `error` key (backward compat) while adding
`code` + `details` for clients to act on programmatically.
"""
from rest_framework.views import exception_handler


def _code_for(status_code: int, default_code: str) -> str:
    mapping = {
        400: 'validation_error',
        401: 'unauthenticated',
        403: 'forbidden',
        404: 'not_found',
        405: 'method_not_allowed',
        406: 'not_acceptable',
        409: 'conflict',
        415: 'unsupported_media_type',
        429: 'throttled',
        500: 'server_error',
    }
    if default_code and default_code not in ('error',):
        return default_code
    return mapping.get(status_code, 'error')


def consistent_exception_handler(exc, context):
    response = exception_handler(exc, context)
    if response is None:
        return None

    # Don't re-wrap if already in envelope.
    if isinstance(response.data, dict) and 'error' in response.data and 'code' in response.data:
        return response

    details = None
    message = 'Request failed.'
    code = getattr(exc, 'default_code', 'error')

    data = response.data
    if isinstance(data, dict) and 'detail' in data and len(data) == 1:
        # e.g. {"detail": "Not found."} from permissions / 404s / throttles
        message = str(data['detail'])
        details = {'detail': str(data['detail'])}
    elif isinstance(data, dict):
        # Validation errors: {"field": ["msg", ...]}
        details = {k: v for k, v in data.items()}
        parts = []
        for field, errs in details.items():
            if isinstance(errs, list):
                parts.append(f'{field}: {"; ".join(str(e) for e in errs)}')
            else:
                parts.append(f'{field}: {errs}')
        message = '; '.join(parts) if parts else 'Invalid input.'
    elif isinstance(data, list):
        details = {'errors': [str(x) for x in data]}
        message = '; '.join(str(x) for x in data)
    else:
        message = str(data)

    response.data = {
        'error': message,
        'message': message,
        'code': _code_for(response.status_code, code),
        'details': details or {},
    }
    return response
