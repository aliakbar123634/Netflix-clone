from django.core.validators import (
    MaxValueValidator,
    MinValueValidator,
)
from django.db import models
from django.utils.text import slugify


class TimeStampedModel(models.Model):

    created_at = models.DateTimeField(
        auto_now_add=True
    )

    updated_at = models.DateTimeField(
        auto_now=True
    )

    class Meta:
        abstract = True


class Genre(TimeStampedModel):

    name = models.CharField(
        max_length=100,
        unique=True
    )

    slug = models.SlugField(
        max_length=120,
        unique=True,
        blank=True
    )

    class Meta:
        ordering = ["name"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.name)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.name


class Person(TimeStampedModel):

    name = models.CharField(
        max_length=150
    )

    photo = models.ImageField(
        upload_to="catalog/people/",
        blank=True,
        null=True
    )

    bio = models.TextField(
        blank=True
    )

    birth_date = models.DateField(
        blank=True,
        null=True
    )

    class Meta:
        ordering = ["name"]

    def __str__(self):
        return self.name


class Movie(TimeStampedModel):

    LANGUAGE_CHOICES = [
        ("en", "English"),
        ("ur", "Urdu"),
        ("hi", "Hindi"),
        ("es", "Spanish"),
        ("fr", "French"),
        ("ar", "Arabic"),
        ("ko", "Korean"),
        ("ja", "Japanese"),
        ("other", "Other"),
    ]

    MATURITY_CHOICES = [
        ("all", "All Ages"),
        ("7+", "7+"),
        ("13+", "13+"),
        ("16+", "16+"),
        ("18+", "18+"),
    ]

    title = models.CharField(
        max_length=255
    )

    slug = models.SlugField(
        max_length=280,
        unique=True,
        blank=True
    )

    description = models.TextField()

    poster = models.ImageField(
        upload_to="catalog/posters/",
        blank=True,
        null=True
    )

    backdrop = models.ImageField(
        upload_to="catalog/backdrops/",
        blank=True,
        null=True
    )

    trailer_url = models.URLField(
        blank=True
    )

    video_url = models.URLField(
        blank=True
    )

    release_year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(2100),
        ]
    )

    duration = models.PositiveIntegerField(
        help_text="Duration in minutes."
    )

    maturity_rating = models.CharField(
        max_length=10,
        choices=MATURITY_CHOICES,
        default="18+"
    )

    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default="en"
    )

    genres = models.ManyToManyField(
        Genre,
        related_name="movies",
        blank=True
    )

    cast = models.ManyToManyField(
        Person,
        related_name="movie_cast",
        blank=True
    )

    directors = models.ManyToManyField(
        Person,
        related_name="directed_movies",
        blank=True
    )

    is_featured = models.BooleanField(
        default=False
    )

    is_published = models.BooleanField(
        default=False
    )

    view_count = models.PositiveBigIntegerField(
        default=0
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.title)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class TVShow(TimeStampedModel):

    LANGUAGE_CHOICES = Movie.LANGUAGE_CHOICES
    MATURITY_CHOICES = Movie.MATURITY_CHOICES

    title = models.CharField(
        max_length=255
    )

    slug = models.SlugField(
        max_length=280,
        unique=True,
        blank=True
    )

    description = models.TextField()

    poster = models.ImageField(
        upload_to="catalog/shows/posters/",
        blank=True,
        null=True
    )

    backdrop = models.ImageField(
        upload_to="catalog/shows/backdrops/",
        blank=True,
        null=True
    )

    trailer_url = models.URLField(
        blank=True
    )

    release_year = models.PositiveIntegerField(
        validators=[
            MinValueValidator(1900),
            MaxValueValidator(2100),
        ]
    )

    maturity_rating = models.CharField(
        max_length=10,
        choices=MATURITY_CHOICES,
        default="18+"
    )

    language = models.CharField(
        max_length=20,
        choices=LANGUAGE_CHOICES,
        default="en"
    )

    genres = models.ManyToManyField(
        Genre,
        related_name="tv_shows",
        blank=True
    )

    cast = models.ManyToManyField(
        Person,
        related_name="show_cast",
        blank=True
    )

    directors = models.ManyToManyField(
        Person,
        related_name="directed_shows",
        blank=True
    )

    is_featured = models.BooleanField(
        default=False
    )

    is_published = models.BooleanField(
        default=False
    )

    view_count = models.PositiveBigIntegerField(
        default=0
    )

    class Meta:
        ordering = ["-created_at"]

    def save(self, *args, **kwargs):

        if not self.slug:
            self.slug = slugify(self.title)

        super().save(*args, **kwargs)

    def __str__(self):
        return self.title


class Season(TimeStampedModel):

    show = models.ForeignKey(
        TVShow,
        on_delete=models.CASCADE,
        related_name="seasons"
    )

    season_number = models.PositiveIntegerField()

    title = models.CharField(
        max_length=255,
        blank=True
    )

    description = models.TextField(
        blank=True
    )

    poster = models.ImageField(
        upload_to="catalog/seasons/",
        blank=True,
        null=True
    )

    class Meta:
        ordering = ["season_number"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "show",
                    "season_number"
                ],
                name="unique_season_per_show"
            )
        ]

    def __str__(self):
        return f"{self.show.title} - Season {self.season_number}"


class Episode(TimeStampedModel):

    season = models.ForeignKey(
        Season,
        on_delete=models.CASCADE,
        related_name="episodes"
    )

    episode_number = models.PositiveIntegerField()

    title = models.CharField(
        max_length=255
    )

    description = models.TextField(
        blank=True
    )

    thumbnail = models.ImageField(
        upload_to="catalog/episodes/",
        blank=True,
        null=True
    )

    video_url = models.URLField(
        blank=True
    )

    trailer_url = models.URLField(
        blank=True
    )

    duration = models.PositiveIntegerField(
        help_text="Duration in minutes."
    )

    release_date = models.DateField(
        blank=True,
        null=True
    )

    is_published = models.BooleanField(
        default=False
    )

    view_count = models.PositiveBigIntegerField(
        default=0
    )

    class Meta:
        ordering = ["episode_number"]

        constraints = [
            models.UniqueConstraint(
                fields=[
                    "season",
                    "episode_number"
                ],
                name="unique_episode_per_season"
            )
        ]

    def __str__(self):
        return (
            f"{self.season.show.title} - "
            f"S{self.season.season_number} "
            f"E{self.episode_number} - "
            f"{self.title}"
        )