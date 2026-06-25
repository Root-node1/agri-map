from rest_framework import generics
from rest_framework.response import Response

from .models import Field
from .serializers import FieldSerializer


class FieldListCreateView(generics.ListCreateAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Field.objects.filter(user=user)
        qs = self._apply_cooperative_sharing(qs, user)
        qs = self._apply_bbox_filter(qs)
        return qs.distinct()

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

    def _apply_cooperative_sharing(self, qs, user):
        try:
            from farmers.models import CooperativeMember, Farmer
            farmer = Farmer.objects.get(user=user)
            coop_ids = CooperativeMember.objects.filter(
                farmer=farmer
            ).values_list('cooperative_id', flat=True)
            if coop_ids:
                member_farmer_ids = CooperativeMember.objects.filter(
                    cooperative_id__in=coop_ids
                ).values_list('farmer_id', flat=True)
                member_user_ids = Farmer.objects.filter(
                    id__in=member_farmer_ids
                ).exclude(user=user).values_list('user_id', flat=True)
                if member_user_ids:
                    qs = qs | Field.objects.filter(user_id__in=member_user_ids)
        except Farmer.DoesNotExist:
            pass
        return qs

    def _apply_bbox_filter(self, qs):
        bbox = self.request.query_params.get('bbox')
        if bbox:
            parts = bbox.split(',')
            if len(parts) == 4:
                west, south, east, north = map(float, parts)
                qs = qs.filter(
                    centroid_lng__gte=west,
                    centroid_lng__lte=east,
                    centroid_lat__gte=south,
                    centroid_lat__lte=north,
                )
        return qs


class FieldDetailView(generics.RetrieveAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Field.objects.filter(user=user)
        qs = FieldListCreateView._apply_cooperative_sharing(self, qs, user)
        return qs.distinct()


class FieldGeoJSONListView(generics.ListAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        user = self.request.user
        qs = Field.objects.filter(user=user)
        qs = FieldListCreateView._apply_cooperative_sharing(self, qs, user)
        return qs.distinct()

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
