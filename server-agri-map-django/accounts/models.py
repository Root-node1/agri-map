from django.contrib.auth import get_user_model
from django.db import models

User = get_user_model()


class Profile(models.Model):
    """Persist the client-selected account type (role).

    The React client Signup sends role in {farmer, cooperative, investor}
    and App.jsx switches dashboards on user.role (admin/cooperative/farmer).
    Django's default User has no role column, so we store it here.
    Staff/superuser accounts are reported as role='admin' regardless.
    """

    ROLE_CHOICES = [
        ('farmer', 'Farmer'),
        ('cooperative', 'Cooperative'),
        ('investor', 'Investor'),
        ('admin', 'Admin'),
    ]

    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=20, choices=ROLE_CHOICES, default='farmer')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f'{self.user.email or self.user.username} ({self.role})'
