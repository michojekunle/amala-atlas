from django.contrib import admin

from verification.models import Verification


# Register your models here.
@admin.register(Verification)
class VerificationAdmin(admin.ModelAdmin):
    list_display = ('candidate', 'action', 'notes')