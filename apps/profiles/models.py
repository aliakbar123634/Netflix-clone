from django.conf import settings
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models
from django.contrib.auth.hashers import make_password, check_password


class Profile(models.Model):

    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("ur", "Urdu"),
        ("hi", "Hindi"),
        ("es", "Spanish"),
        ("fr", "French"),
        ("ar", "Arabic"),
    ]

    MATURITY_CHOICES = [
        ("all", "All Ages"),
        ("7+", "7+"),
        ("13+", "13+"),
        ("16+", "16+"),
        ("18+", "18+"),
    ]

    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE,
        related_name="profiles",
    )

    name = models.CharField(
        max_length=50
    )

    avatar = models.ImageField(
        upload_to="profiles/avatars/",
        blank=True,
        null=True,
    )

    is_kids = models.BooleanField(
        default=False
    )

    language = models.CharField(
        max_length=10,
        choices=LANGUAGE_CHOICES,
        default="en",
    )

    maturity_level = models.CharField(
        max_length=10,
        choices=MATURITY_CHOICES,
        default="18+",
    )

    pin = models.CharField(
        max_length=128,
        blank=True,
        null=True,
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
        ordering = ["created_at"]
        constraints = [
            models.UniqueConstraint(
                fields=["user", "name"],
                name="unique_profile_name_per_user",
            )
        ]

    def set_pin(self, raw_pin):
        if raw_pin:
            self.pin = make_password(raw_pin)
        else:
            self.pin = None

    def check_pin(self, raw_pin):
        if not self.pin:
            return True

        return check_password(
            raw_pin,
            self.pin
        )

    def __str__(self):
        return f"{self.name} - {self.user.email}"