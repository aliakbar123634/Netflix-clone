from django.conf import settings
from django.db import models


class Plan(models.Model):

    VIDEO_QUALITIES = [
        ("SD", "SD"),
        ("HD", "HD"),
        ("FULL_HD", "Full HD"),
        ("4K", "4K"),
    ]

    name = models.CharField(
        max_length=100,
        unique=True
    )

    price = models.DecimalField(
        max_digits=10,
        decimal_places=2
    )

    video_quality = models.CharField(
        max_length=20,
        choices=VIDEO_QUALITIES,
        default="HD"
    )

    max_devices = models.PositiveIntegerField(
        default=1
    )

    is_active = models.BooleanField(
        default=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "price"
        ]

    def __str__(self):

        return self.name


class Subscription(models.Model):

    STATUS_CHOICES = [
        ("active", "Active"),
        ("expired", "Expired"),
        ("cancelled", "Cancelled"),
        ("pending", "Pending"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="subscriptions"
    )

    plan = models.ForeignKey(
        Plan,
        on_delete=models.PROTECT,
        related_name="subscriptions"
    )

    start_date = models.DateTimeField()

    end_date = models.DateTimeField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending"
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        ordering = [
            "-created_at"
        ]

    def __str__(self):

        return (
            f"{self.user} - "
            f"{self.plan.name} - "
            f"{self.status}"
        )