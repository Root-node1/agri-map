from django.db import connection
from django.db.utils import OperationalError
from drf_spectacular.utils import extend_schema
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.request import Request
from rest_framework.response import Response


@extend_schema(
    summary='Health check',
    description='Returns API status and version',
    tags=['Health'],
    responses={200: None},
)
@api_view(['GET'])
@permission_classes([AllowAny])
def health(_request: Request) -> Response:
    db_ok = False
    try:
        connection.ensure_connection()
        db_ok = True
    except OperationalError:
        pass
    return Response({
        'status': 'ok' if db_ok else 'degraded',
        'version': '1.0.0',
        'database': 'connected' if db_ok else 'unreachable',
    })
