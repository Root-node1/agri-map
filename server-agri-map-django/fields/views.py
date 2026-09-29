from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from server_agri_map_django.open_access import resolve_user

from .models import Field
from .serializers import FieldSerializer


def apply_cooperative_sharing(qs, user):
    return qs


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


class FieldListCreateView(generics.ListCreateAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        qs = Field.objects.all()
        qs = apply_cooperative_sharing(qs, None)
        qs = apply_bbox_filter(qs, self.request.query_params.get('bbox'))
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(user=resolve_user(self.request))


class FieldDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        return Field.objects.all()


class FieldGeoJSONListView(generics.ListAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        return Field.objects.all()

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
