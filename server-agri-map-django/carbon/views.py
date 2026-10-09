from django.db.models import Sum
from django.urls import reverse
from drf_spectacular.utils import extend_schema
from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from fields.models import Field
from server_agri_map_django.caching import bump_user_viewcache, cached_get_view
from server_agri_map_django.permissions import owned_or_shared_field_or_404
from .models import CarbonSequestration
from .serializers import CarbonResponseSerializer


def _visible_fields(user):
    """Fields the requester may see (own + cooperative-shared)."""
    from fields.views import apply_cooperative_sharing
    return apply_cooperative_sharing(Field.objects.all(), user)


@extend_schema(summary='Carbon stats', responses={200: CarbonResponseSerializer})
class CarbonStatsView(APIView):
    @cached_get_view()
    def get(self, request):
        fields = _visible_fields(request.user)
        records = CarbonSequestration.objects.filter(field__in=fields)
        total = records.aggregate(total=Sum('carbon_tons'))['total'] or 0
        return Response({
            'total': total,
            'totalCredits': total,
            'total_tons': total,
            'available': total,
            'sold': 0,
            'field_count': fields.count(),
            'records_count': records.count(),
        })


@extend_schema(summary='List carbon records', responses={200: CarbonResponseSerializer})
class CarbonListView(APIView):
    @cached_get_view()
    def get(self, request):
        fields = _visible_fields(request.user)
        records = CarbonSequestration.objects.filter(field__in=fields).select_related('field')
        credits = [{
            'id': r.id,
            'field_id': r.field_id,
            'field': r.field.name,
            'amount': r.carbon_tons,
            'carbon_tons': r.carbon_tons,
            'price': None,
            'status': 'available',
            'confidence_score': r.confidence_score,
            'methodology': r.methodology,
            'calculated_at': r.calculated_at,
        } for r in records]
        return Response({'count': len(credits), 'results': credits, 'credits': credits})


@extend_schema(
    summary='Get carbon sequestration',
    description='Returns estimated carbon sequestration data for a field',
    tags=['Carbon'],
    responses={200: CarbonResponseSerializer},
)
class CarbonDetailView(APIView):
    serializer_class = serializers.Serializer
    @cached_get_view()
    def get(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)

        record = CarbonSequestration.objects.filter(field=field).first()
        if record is None:
            return Response(
                {'error': 'No carbon data for this field',
                 'message': 'No carbon data for this field',
                 'code': 'not_found', 'details': {}},
                status=status.HTTP_404_NOT_FOUND,
            )

        return Response({
            'field_id': field.id,
            'carbon_tons': record.carbon_tons,
            'confidence_score': record.confidence_score,
            'methodology': record.methodology,
            'calculated_at': record.calculated_at,
        })


class CarbonCreateSerializer(serializers.Serializer):
    carbon_tons = serializers.FloatField(min_value=0)
    confidence_score = serializers.FloatField(min_value=0, max_value=1)
    methodology = serializers.ChoiceField(choices=['ndvi_based', 'soil_organic_carbon', 'biomass_estimation'])


class CarbonCreateView(APIView):
    @extend_schema(
        summary='Record carbon sequestration',
        description='Records estimated carbon sequestration for a field. Supports Idempotency-Key header.',
        tags=['Carbon'],
        request=CarbonCreateSerializer,
        responses={201: CarbonResponseSerializer},
    )
    def post(self, request, field_id=None):
        field = owned_or_shared_field_or_404(request.user, field_id)

        serializer = CarbonCreateSerializer(data=request.data)
        if not serializer.is_valid():
            return Response({'error': serializer.errors}, status=status.HTTP_400_BAD_REQUEST)

        record = CarbonSequestration.objects.create(
            field=field,
            **serializer.validated_data,
        )
        bump_user_viewcache(request.user)
        return Response({
            'field_id': field.id,
            'carbon_tons': record.carbon_tons,
            'confidence_score': record.confidence_score,
            'methodology': record.methodology,
            'calculated_at': record.calculated_at,
        }, status=status.HTTP_201_CREATED, headers={
            'Location': reverse('carbon-detail', kwargs={'field_id': field.id}),
        })
