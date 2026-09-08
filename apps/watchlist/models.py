from django.conf import settings
from django.contrib.contenttypes.fields import GenericForeignKey
from django.contrib.contenttypes.models import ContentType
from django.db import models

from apps.profiles.models import Profile


class MyList(models.Model):

    profile = models.ForeignKey(
        Profile,
        on_delete=models.CASCADE,
        related_name="my_list",
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

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    class Meta:
        ordering = ["-created_at"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "profile",
                    "content_type",
                    "object_id",
                ],
                name="unique_my_list_item_per_profile",
            )
        ]

    def __str__(self):
        return f"{self.profile.name} - {self.content}"