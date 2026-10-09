from django.db import IntegrityError

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from server_agri_map_django.http import CanonicalLocationMixin
from server_agri_map_django.open_access import resolve_user
from server_agri_map_django.permissions import assert_coop_admin

from .models import Cooperative, CooperativeMember, Farmer
from .serializers import CooperativeMemberSerializer, CooperativeSerializer, FarmerSerializer


class FarmerRegisterView(CanonicalLocationMixin, generics.CreateAPIView):
    serializer_class = FarmerSerializer
    location_static = '/api/farmers/me/'

    def create(self, request, *args, **kwargs):
        # P0 idempotent register: retry returns the existing profile.
        existing = Farmer.objects.filter(user=request.user).first()
        if existing is not None:
            return Response(
                FarmerSerializer(existing).data, status=status.HTTP_200_OK,
            )
        return super().create(request, *args, **kwargs)

    def perform_create(self, serializer):
        serializer.save(user=resolve_user(self.request))


class FarmerMeView(generics.RetrieveUpdateAPIView):
    serializer_class = FarmerSerializer

    def get_object(self):
        farmer, _ = Farmer.objects.get_or_create(user=resolve_user(self.request))
        return farmer


class CooperativeListCreateView(CanonicalLocationMixin, generics.ListCreateAPIView):
    queryset = Cooperative.objects.all()
    serializer_class = CooperativeSerializer
    location_route = 'cooperative-detail'
    search_fields = ('name', 'location')
    ordering_fields = ('created_at', 'name')
    ordering = ('-created_at',)

    def perform_create(self, serializer):
        serializer.save(created_by=resolve_user(self.request))


class CooperativeDetailView(generics.RetrieveAPIView):
    queryset = Cooperative.objects.all()
    serializer_class = CooperativeSerializer


def _assert_admin(cooperative, user):
    assert_coop_admin(cooperative, user)


class CooperativeMemberListCreateView(CanonicalLocationMixin, generics.ListCreateAPIView):
    serializer_class = CooperativeMemberSerializer
    location_route = 'cooperative-member-detail'
    ordering_fields = ('joined_at',)
    ordering = ('joined_at',)

    def get_location_kwargs(self, data):
        return {'pk': data['cooperative'], 'member_pk': data['id']}

    def _get_cooperative(self):
        cooperative = generics.get_object_or_404(Cooperative, pk=self.kwargs['pk'])
        user = self.request.user
        is_related = (
            cooperative.created_by_id == user.pk
            or CooperativeMember.objects.filter(
                cooperative=cooperative, farmer__user=user,
            ).exists()
        )
        if not is_related:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a member of this cooperative.')
        return cooperative

    def get_queryset(self):
        self._get_cooperative()
        return CooperativeMember.objects.filter(cooperative_id=self.kwargs['pk']).select_related('farmer__user')

    def perform_create(self, serializer):
        cooperative = self._get_cooperative()
        _assert_admin(cooperative, self.request.user)

        user_id = self.request.data.get('user_id')
        if not user_id:
            raise ValidationError({'user_id': 'This field is required.'})
        try:
            farmer = Farmer.objects.get(user_id=user_id)
        except Farmer.DoesNotExist:
            raise ValidationError({'user_id': 'User does not have a farmer profile.'})

        try:
            serializer.save(cooperative=cooperative, farmer=farmer)
        except IntegrityError:
            raise ValidationError({'error': 'This user is already a member of this cooperative.'})


class CooperativeMemberDetailView(generics.RetrieveUpdateDestroyAPIView):
    serializer_class = CooperativeMemberSerializer
    lookup_url_kwarg = 'member_pk'

    def get_queryset(self):
        cooperative = generics.get_object_or_404(Cooperative, pk=self.kwargs['pk'])
        user = self.request.user
        is_related = (
            cooperative.created_by_id == user.pk
            or CooperativeMember.objects.filter(
                cooperative=cooperative, farmer__user=user,
            ).exists()
        )
        if not is_related:
            from rest_framework.exceptions import PermissionDenied
            raise PermissionDenied('You are not a member of this cooperative.')
        return CooperativeMember.objects.filter(cooperative_id=self.kwargs['pk'])

    def perform_update(self, serializer):
        _assert_admin(serializer.instance.cooperative, self.request.user)
        serializer.save()

    def perform_destroy(self, instance):
        _assert_admin(instance.cooperative, self.request.user)
        instance.delete()
