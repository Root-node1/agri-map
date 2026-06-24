from django.contrib.auth import get_user_model
from drf_spectacular.utils import extend_schema, extend_schema_view
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .serializers import AuthResponseSerializer, RegisterSerializer, UserSerializer

User = get_user_model()


@extend_schema(
    summary='Register a new user',
    description='Creates a user account and returns JWT tokens',
    tags=['Auth'],
    responses={201: AuthResponseSerializer},
)
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = (permissions.AllowAny,)

    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        refresh = RefreshToken.for_user(user)
        return Response({
            'user': UserSerializer(user).data,
            'access': str(refresh.access_token),
            'refresh': str(refresh),
        }, status=status.HTTP_201_CREATED)


@extend_schema(
    summary='Get current user',
    description='Returns the authenticated user profile',
    tags=['Auth'],
)
class MeView(generics.RetrieveAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

    def get_object(self):
        return self.request.user


@extend_schema_view(
    post=extend_schema(summary='Login', description='Obtain JWT access and refresh tokens', tags=['Auth']),
)
class LoginView(TokenObtainPairView):
    pass


@extend_schema_view(
    post=extend_schema(summary='Refresh token', description='Obtain a new access token using a refresh token', tags=['Auth']),
)
class RefreshTokenView(TokenRefreshView):
    pass
