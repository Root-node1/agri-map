from rest_framework import generics, permissions, status
from rest_framework.response import Response

from .models import Cooperative, Farmer
from .serializers import CooperativeSerializer, FarmerSerializer


class FarmerRegisterView(generics.CreateAPIView):
    serializer_class = FarmerSerializer
    permission_classes = (permissions.IsAuthenticated,)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FarmerMeView(generics.RetrieveUpdateAPIView):
    serializer_class = FarmerSerializer

    def get_object(self):
        farmer, _ = Farmer.objects.get_or_create(user=self.request.user)
        return farmer


class CooperativeListCreateView(generics.ListCreateAPIView):
    queryset = Cooperative.objects.all()
    serializer_class = CooperativeSerializer

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class CooperativeDetailView(generics.RetrieveAPIView):
    queryset = Cooperative.objects.all()
    serializer_class = CooperativeSerializer
