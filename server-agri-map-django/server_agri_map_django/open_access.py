from django.contrib.auth import get_user_model

OPEN_ACCESS_USERNAME = 'open-access'


def get_default_user():
    User = get_user_model()
    user, _ = User.objects.get_or_create(
        username=OPEN_ACCESS_USERNAME,
        defaults={'email': 'open-access@example.com'},
    )
    return user


def resolve_user(request):
    return get_default_user()
