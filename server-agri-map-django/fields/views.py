from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from server_agri_map_django.open_access import resolve_user

from farmers.models import CooperativeMember
from server_agri_map_django.http import CanonicalLocationMixin

from .models import Field
from .serializers import FieldSerializer


def apply_cooperative_sharing(qs, user):
    """P0: users see their own fields plus fields shared via a common
    cooperative. Falls back to empty when user is missing."""
    if user is None or not user.is_authenticated:
        return qs.none()
    coop_ids = CooperativeMember.objects.filter(
        farmer__user=user,
    ).values_list('cooperative_id', flat=True)
    member_user_ids = CooperativeMember.objects.filter(
        cooperative_id__in=coop_ids,
    ).values_list('farmer__user_id', flat=True)
    return qs.filter(user_id__in=list(member_user_ids) + [user.pk])


def apply_bbox_filter(qs, bbox_param):
    if bbox_param:
        parts = bbox_param.split(',')
        if len(parts) != 4:
            raise ValidationError({'bbox': 'Must be exactly 4 comma-separated values: west,south,east,north.'})
        try:
            west, south, east, north = map(float, parts)
        except (ValueError, TypeError):
            raise ValidationError({'bbox': 'All values must be numbers.'})
        qs = qs.filter(
            centroid_lng__gte=west,
            centroid_lng__lte=east,
            centroid_lat__gte=south,
            centroid_lat__lte=north,
        )
    return qs


class FieldListCreateView(CanonicalLocationMixin, generics.ListCreateAPIView):
    serializer_class = FieldSerializer
    location_route = 'field-detail'
    search_fields = ('name', 'location', 'crop_type')
    ordering_fields = ('created_at', 'updated_at', 'name', 'area_ha', 'crop_type')
    ordering = ('-created_at',)

    def get_queryset(self):
        qs = Field.objects.all()
        qs = apply_cooperative_sharing(qs, self.request.user)
        qs = apply_bbox_filter(qs, self.request.query_params.get('bbox'))
        return qs.distinct().select_related('user')

    def perform_create(self, serializer):
        serializer.save(user=resolve_user(self.request))


class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        return apply_cooperative_sharing(Field.objects.all(), self.request.user)


class FieldGeoJSONListView(generics.ListAPIView):
    serializer_class = FieldSerializer
    pagination_class = None

    def get_queryset(self):
        # P0: cap unbounded export; use bbox filter + pagination via
        # list endpoint for large collections.
        qs = apply_cooperative_sharing(Field.objects.all(), self.request.user)
        return qs.order_by('-created_at')[:500]

    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        features = []
        for item in serializer.data:
            features.append({
                'type': 'Feature',
                'id': item['id'],
                'geometry': item['geometry'],
                'properties': {
                    'id': item['id'],
                    'name': item['name'],
                    'area_ha': item['area_ha'],
                    'location': item.get('location'),
                    'crop_type': item.get('crop_type'),
                    'centroid_lat': item['centroid_lat'],
                    'centroid_lng': item['centroid_lng'],
                    'created_at': item['created_at'],
                    'updated_at': item['updated_at'],
                },
            })
        return Response({
            'type': 'FeatureCollection',
            'features': features,
        })
