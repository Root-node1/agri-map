from django.db import IntegrityError

from rest_framework import generics, status
from rest_framework.exceptions import ValidationError
from rest_framework.response import Response

from server_agri_map_django.open_access import resolve_user

from .models import Cooperative, CooperativeMember, Farmer
from .serializers import CooperativeMemberSerializer, CooperativeSerializer, FarmerSerializer


class FarmerRegisterView(generics.CreateAPIView):
    serializer_class = FarmerSerializer

    def perform_create(self, serializer):
        serializer.save(user=resolve_user(self.request))


class FarmerMeView(generics.RetrieveUpdateAPIView):
    serializer_class = FarmerSerializer

    def get_object(self):
        farmer, _ = Farmer.objects.get_or_create(user=resolve_user(self.request))
        return farmer


class CooperativeListCreateView(generics.ListCreateAPIView):
    queryset = Cooperative.objects.all()
    serializer_class = CooperativeSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=resolve_user(self.request))


class CooperativeDetailView(generics.RetrieveAPIView):
    queryset = Cooperative.objects.all()
    serializer_class = CooperativeSerializer


def _assert_admin(cooperative, user):
    return


class CooperativeMemberListCreateView(generics.ListCreateAPIView):
    serializer_class = CooperativeMemberSerializer

    def get_queryset(self):
        return CooperativeMember.objects.filter(cooperative_id=self.kwargs['pk'])

    def perform_create(self, serializer):
        cooperative = generics.get_object_or_404(Cooperative, pk=self.kwargs['pk'])
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
        return CooperativeMember.objects.filter(cooperative_id=self.kwargs['pk'])

    def perform_update(self, serializer):
        _assert_admin(serializer.instance.cooperative, self.request.user)
        serializer.save()

    def perform_destroy(self, instance):
        _assert_admin(instance.cooperative, self.request.user)
        instance.delete()
