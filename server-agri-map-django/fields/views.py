from rest_framework import generics

from .models import Field
from .serializers import FieldSerializer


class FieldListCreateView(generics.ListCreateAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        return Field.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        serializer.save(user=self.request.user)


class FieldDetailView(generics.RetrieveAPIView):
    serializer_class = FieldSerializer

    def get_queryset(self):
        return Field.objects.filter(user=self.request.user)
