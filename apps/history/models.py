from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.profiles.models import Profile


class WatchProgress(models.Model):

    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="watch_progress",
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )

    object_id = models.PositiveBigIntegerField()

    content = GenericForeignKey(
        "content_type",
        "object_id",
    )

    position = models.PositiveBigIntegerField(
        default=0,
        help_text="Current position in seconds."
    )

    duration = models.PositiveBigIntegerField(
        default=0,
        help_text="Total duration in seconds."
    )

    completed = models.BooleanField(
        default=False
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:

        ordering = ["-updated_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "profile",
                    "content_type",
                    "object_id",
                ],
                name="unique_watch_progress_per_profile",
            )
        ]

    def __str__(self):

        return (
            f"{self.profile.name} - "
            f"{self.content}"
        )

class WatchHistory(models.Model):

    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="watch_history",
    )

    content_type = models.ForeignKey(
        ContentType,
        on_delete=models.CASCADE,
    )

    object_id = models.PositiveBigIntegerField()

    content = GenericForeignKey(
        "content_type",
        "object_id",
    )

    watched_at = models.DateTimeField(
        auto_now=True
    )

    completed = models.BooleanField(
        default=False
    )

    class Meta:

        ordering = ["-watched_at"]

    def __str__(self):

        return (
            f"{self.profile.name} - "
            f"{self.content}"
        )    