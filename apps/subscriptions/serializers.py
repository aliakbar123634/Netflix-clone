from django.utils import timezone

from rest_framework import serializers

from apps.subscriptions.models import (
    Plan,
    Subscription,
)


class PlanSerializer(serializers.ModelSerializer):

    class Meta:

        model = Plan

        fields = [
            "id",
            "name",
            "price",
            "video_quality",
            "max_devices",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "created_at",
            "updated_at",
        ]


class SubscriptionSerializer(serializers.ModelSerializer):

    plan = PlanSerializer(
        read_only=True
    )

    class Meta:

        model = Subscription

        fields = [
            "id",
            "plan",
            "start_date",
            "end_date",
            "status",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "plan",
            "status",
            "created_at",
            "updated_at",
        ]

    def to_representation(
        self,
        instance
    ):

        data = super().to_representation(
            instance
        )

        # Automatically show expired
        # if end date has passed.

        if (
            instance.status == "active"
            and
            instance.end_date <= timezone.now()
        ):

            data["status"] = "expired"

        return data