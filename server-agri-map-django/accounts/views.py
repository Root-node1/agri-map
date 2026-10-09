from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes, force_str
from django.utils.http import urlsafe_base64_decode, urlsafe_base64_encode
from drf_spectacular.utils import extend_schema
from rest_framework import generics, permissions, status
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenBlacklistView, TokenRefreshView

from .serializers import (
    AuthResponseSerializer,
    EmailLoginSerializer,
    ForgotPasswordSerializer,
    RegisterSerializer,
    ResetPasswordSerializer,
    UserSerializer,
    get_role_for_user,
    needs_farmer_profile,
)

User = get_user_model()
token_generator = PasswordResetTokenGenerator()


def build_auth_response(user):
    refresh = RefreshToken.for_user(user)
    return {
        'user': UserSerializer(user).data,
        'access': str(refresh.access_token),
        'refresh': str(refresh),
        'needsProfile': needs_farmer_profile(user),
    }


class RegisterView(generics.CreateAPIView):
    permission_classes = [permissions.AllowAny]
    serializer_class = RegisterSerializer
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(summary='Register with email', responses={201: AuthResponseSerializer})
    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()
        return Response(build_auth_response(user), status=status.HTTP_201_CREATED)


class LoginView(APIView):
    """Email + password login. Returns user + tokens (client expects user)."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(summary='Login with email', request=EmailLoginSerializer,
                   responses={200: AuthResponseSerializer})
    def post(self, request):
        serializer = EmailLoginSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.validated_data['user']
        return Response(build_auth_response(user), status=status.HTTP_200_OK)


class RefreshView(TokenRefreshView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'


class LogoutView(TokenBlacklistView):
    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    def post(self, request, *args, **kwargs):
        # Tolerate clients that POST without a refresh token (e.g. fire-and-
        # forget logout that only clears local storage). Blacklist when a
        # token is supplied, always return 200 so logout never strands UI.
        refresh = None
        if isinstance(request.data, dict):
            refresh = request.data.get('refresh')
        if not refresh:
            return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)
        try:
            return super().post(request, *args, **kwargs)
        except Exception:
            return Response({'message': 'Logged out.'}, status=status.HTTP_200_OK)


class UserListView(generics.ListAPIView):
    """Staff-only user directory backing the admin dashboard.

    Returns both canonical keys and the legacy aliases the client reads
    (_id, name, status, createdAt) so either shape works.
    """

    permission_classes = [permissions.IsAdminUser]
    serializer_class = UserSerializer

    def get_queryset(self):
        return User.objects.all().order_by('-date_joined')

    def list(self, request, *args, **kwargs):
        page = self.paginate_queryset(self.get_queryset())
        users = page if page is not None else self.get_queryset()
        results = []
        for u in users:
            data = UserSerializer(u).data
            results.append({
                **data,
                '_id': data['id'],
                'name': data.get('name') or data.get('username'),
                'status': 'active' if u.is_active else 'disabled',
                'createdAt': data.get('date_joined'),
            })
        if page is not None:
            paginated = self.paginator.get_paginated_response(results)
            paginated.data['users'] = paginated.data.pop('results')
            return paginated
        return Response({'users': results})


class MeView(APIView):
    @extend_schema(summary='Current user', responses={200: UserSerializer})
    def get(self, request):
        return Response(UserSerializer(request.user).data)


class ForgotPasswordView(APIView):
    """Accept {email}, always return success (no account enumeration).

    Generates a Django reset token; emails it when mail is configured.
    In DEBUG the reset_token is echoed for local client testing.
    """

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(summary='Request password reset', request=ForgotPasswordSerializer)
    def post(self, request):
        serializer = ForgotPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        email = serializer.validated_data['email'].strip().lower()
        user = User.objects.filter(email__iexact=email).first()
        data = {'message': 'If an account exists for this email, reset instructions were sent.'}
        if user is not None:
            uid = urlsafe_base64_encode(force_bytes(user.pk))
            token = token_generator.make_token(user)
            reset_token = f'{uid}:{token}'
            try:
                send_mail(
                    'AgriMap password reset',
                    f'Use this token to reset your password: {reset_token}',
                    getattr(settings, 'DEFAULT_FROM_EMAIL', 'noreply@agrimap.local'),
                    [email],
                    fail_silently=True,
                )
            except Exception:
                pass
            if getattr(settings, 'DEBUG', False):
                data['reset_token'] = reset_token
        return Response(data, status=status.HTTP_200_OK)


class ResetPasswordView(APIView):
    """Accept {token, new_password} where token is 'uidb64:token' from forgot."""

    permission_classes = [permissions.AllowAny]
    throttle_classes = [ScopedRateThrottle]
    throttle_scope = 'auth'

    @extend_schema(summary='Reset password', request=ResetPasswordSerializer)
    def post(self, request):
        serializer = ResetPasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        raw_token = serializer.validated_data['token'].strip()
        new_password = serializer.validated_data['new_password']
        email = (serializer.validated_data.get('email') or '').strip().lower()
        uid = (serializer.validated_data.get('uid') or '').strip()

        token_part = raw_token
        if ':' in raw_token:
            uid, token_part = raw_token.split(':', 1)
        if not uid and email:
            user = User.objects.filter(email__iexact=email).first()
            if user is None:
                return Response({'error': 'Invalid reset token.', 'code': 'invalid_token',
                                 'details': {}},
                                status=status.HTTP_400_BAD_REQUEST)
            uid = urlsafe_base64_encode(force_bytes(user.pk))
        try:
            user_id = force_str(urlsafe_base64_decode(uid))
            user = User.objects.get(pk=user_id)
        except Exception:
            return Response({'error': 'Invalid reset token.', 'code': 'invalid_token',
                             'details': {}},
                            status=status.HTTP_400_BAD_REQUEST)
        if not token_generator.check_token(user, token_part):
            return Response({'error': 'Invalid or expired reset token.', 'code': 'invalid_token',
                             'details': {}},
                            status=status.HTTP_400_BAD_REQUEST)
        user.set_password(new_password)
        user.save(update_fields=['password'])
        # Role is unchanged; keep profile consistent for the client shape.
        get_role_for_user(user)
        return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)
