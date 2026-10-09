from django.contrib.auth import authenticate, get_user_model
from rest_framework import serializers

from .models import Profile

User = get_user_model()

CLIENT_ROLES = ('farmer', 'cooperative', 'investor')


def get_role_for_user(user) -> str:
    """Single source of truth for the client-facing user.role.

    App.jsx switches dashboards on admin/cooperative/other, so this must
    always return a value. Staff users are admins; everyone else uses
    their Profile (auto-created as farmer).
    """
    if user.is_staff or user.is_superuser:
        return 'admin'
    profile, _ = Profile.objects.get_or_create(user=user)
    return profile.role


def get_farmer_info(user) -> tuple:
    """Return (phone, location) from the linked Farmer profile, if any."""
    try:
        farmer = user.farmer
    except Exception:
        return '', ''
    return farmer.phone or '', farmer.location or ''


def needs_farmer_profile(user) -> bool:
    """Farmer accounts need phone+location before using the dashboard."""
    if get_role_for_user(user) != 'farmer':
        return False
    phone, location = get_farmer_info(user)
    return not (phone.strip() and location.strip())


class UserSerializer(serializers.ModelSerializer):
    name = serializers.CharField(source='first_name', read_only=True)
    role = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    location = serializers.SerializerMethodField()
    needsProfile = serializers.SerializerMethodField()

    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'name', 'role', 'phone', 'location',
                  'needsProfile', 'date_joined')
        read_only_fields = fields

    def get_role(self, obj) -> str:
        return get_role_for_user(obj)

    def get_phone(self, obj) -> str:
        phone, _ = get_farmer_info(obj)
        return phone

    def get_location(self, obj) -> str:
        _, location = get_farmer_info(obj)
        return location

    def get_needsProfile(self, obj) -> bool:
        return needs_farmer_profile(obj)


class RegisterSerializer(serializers.Serializer):
    """Client Signup sends {name, email, password, role, phone}.

    Email is the login identity: we store username=email so the default
    auth backend keeps working while the client only deals with email.
    Accepts legacy {username, ...} payloads too.
    """

    email = serializers.EmailField()
    password = serializers.CharField(write_only=True, min_length=8)
    name = serializers.CharField(required=False, allow_blank=True, default='')
    role = serializers.CharField(required=False, default='farmer')
    phone = serializers.CharField(required=False, allow_blank=True, default='')
    username = serializers.CharField(required=False, allow_blank=True, default='')

    def validate_email(self, value):
        email = value.strip().lower()
        if User.objects.filter(email__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        if User.objects.filter(username__iexact=email).exists():
            raise serializers.ValidationError('An account with this email already exists.')
        return email

    def validate_role(self, value):
        value = (value or 'farmer').strip().lower()
        if value == 'admin':
            raise serializers.ValidationError('Cannot self-register as admin.')
        if value not in CLIENT_ROLES:
            raise serializers.ValidationError(f'Role must be one of {", ".join(CLIENT_ROLES)}.')
        return value

    def create(self, validated_data):
        from farmers.models import Farmer

        email = validated_data['email'].strip().lower()
        username = (validated_data.get('username') or '').strip() or email
        # Guarantee username uniqueness when a legacy username is supplied.
        if User.objects.filter(username__iexact=username).exists():
            username = email
        name = (validated_data.get('name') or '').strip()
        role = validated_data.get('role') or 'farmer'
        phone = (validated_data.get('phone') or '').strip()

        user = User.objects.create_user(
            username=username,
            email=email,
            password=validated_data['password'],
            first_name=name,
        )
        Profile.objects.update_or_create(user=user, defaults={'role': role})
        if role == 'farmer' and phone:
            Farmer.objects.get_or_create(user=user, defaults={'phone': phone})
            # Ensure phone saved even if Farmer row already existed.
            farmer = user.farmer
            if not farmer.phone:
                farmer.phone = phone
                farmer.save(update_fields=['phone'])
        return user


class EmailLoginSerializer(serializers.Serializer):
    """Client Login sends {email, password}. Accept legacy {username, ...}."""

    email = serializers.EmailField(required=False, allow_blank=True)
    username = serializers.CharField(required=False, allow_blank=True)
    password = serializers.CharField(write_only=True)

    def validate(self, attrs):
        email = (attrs.get('email') or '').strip().lower()
        legacy_username = (attrs.get('username') or '').strip()
        password = attrs.get('password') or ''
        if not password:
            raise serializers.ValidationError({'password': 'This field is required.'})
        identifier = email or legacy_username
        if not identifier:
            raise serializers.ValidationError({'email': 'Email is required.'})
        # Email is the username: resolve to the actual username for auth.
        user_obj = (User.objects.filter(email__iexact=identifier).first()
                    or User.objects.filter(username__iexact=identifier).first())
        if user_obj is None:
            raise serializers.ValidationError('Invalid email or password.')
        user = authenticate(username=user_obj.username, password=password)
        if user is None:
            raise serializers.ValidationError('Invalid email or password.')
        if not user.is_active:
            raise serializers.ValidationError('Account is disabled.')
        attrs['user'] = user
        return attrs


class ForgotPasswordSerializer(serializers.Serializer):
    email = serializers.EmailField()


class ResetPasswordSerializer(serializers.Serializer):
    token = serializers.CharField()
    new_password = serializers.CharField(write_only=True, min_length=8)
    email = serializers.EmailField(required=False, allow_blank=True)
    uid = serializers.CharField(required=False, allow_blank=True)


class AuthResponseSerializer(serializers.Serializer):
    user = UserSerializer()
    access = serializers.CharField()
    refresh = serializers.CharField()
    needsProfile = serializers.BooleanField()
