"""Shared ownership helpers (P0: fix IDOR / cross-user access)."""
from django.http import Http404
from django.shortcuts import get_object_or_404
from rest_framework.exceptions import PermissionDenied

from farmers.models import CooperativeMember
from fields.models import Field


def owned_field_or_404(user, field_id) -> Field:
    """Return the field owned by `user`, or 404 (no existence oracle)."""
    return get_object_or_404(Field, pk=field_id, user=user)


def owned_or_shared_field_or_404(user, field_id) -> Field:
    """Owner access plus cooperative sharing: any field owned by a user
    who shares a cooperative with `user` (mirrors apply_cooperative_sharing
    in fields/views.py so detail-style endpoints agree with list output)."""
    field = get_object_or_404(Field, pk=field_id)
    if field.user_id == user.pk:
        return field
    user_coops = CooperativeMember.objects.filter(
        farmer__user_id=user.pk,
    ).values_list('cooperative_id', flat=True)
    shared = CooperativeMember.objects.filter(
        cooperative_id__in=user_coops,
        farmer__user_id=field.user_id,
    ).exists()
    if not shared:
        raise Http404
    return field


def assert_coop_admin(cooperative, user) -> None:
    """Only the creator or a member with role=admin may manage members."""
    if cooperative.created_by_id == user.pk:
        return
    is_admin = cooperative.members.filter(
        farmer__user=user, role='admin',
    ).exists()
    if not is_admin:
        raise PermissionDenied('Only cooperative admins can manage members.')
