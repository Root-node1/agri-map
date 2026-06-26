from django.contrib import admin

from .models import Cooperative, CooperativeMember, Farmer

admin.site.register(Farmer)
admin.site.register(Cooperative)
admin.site.register(CooperativeMember)
