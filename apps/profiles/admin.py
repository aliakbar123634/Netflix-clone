from django.contrib import admin

from .models import Profile


@admin.register(Profile)
class ProfileAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "user",
        "is_kids",
        "language",
        "maturity_level",
        "is_active",
        "created_at",
    )

    list_filter = (
        "is_kids",
        "language",
        "maturity_level",
        "is_active",
    )

    search_fields = (
        "name",
        "user__email",
    )

    ordering = (
        "-created_at",
    )