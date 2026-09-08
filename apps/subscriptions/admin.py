from django.contrib import admin

from apps.subscriptions.models import (
    Plan,
    Subscription,
)


@admin.register(Plan)
class PlanAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "name",
        "price",
        "video_quality",
        "max_devices",
        "is_active",
    ]

    list_filter = [
        "video_quality",
        "is_active",
    ]

    search_fields = [
        "name",
    ]

    ordering = [
        "price"
    ]


@admin.register(Subscription)
class SubscriptionAdmin(admin.ModelAdmin):

    list_display = [
        "id",
        "user",
        "plan",
        "start_date",
        "end_date",
        "status",
    ]

    list_filter = [
        "status",
        "plan",
    ]

    search_fields = [
        "user__username",
        "user__email",
    ]

    autocomplete_fields = [
        "user",
        "plan",
    ]

    ordering = [
        "-created_at"
    ]