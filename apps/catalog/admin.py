from django.contrib import admin

from .models import (
    Genre,
    Person,
    Movie,
    TVShow,
    Season,
    Episode,
)


@admin.register(Genre)
class GenreAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "slug",
    )

    search_fields = (
        "name",
    )

    prepopulated_fields = {
        "slug": ("name",)
    }


@admin.register(Person)
class PersonAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "name",
        "birth_date",
    )

    search_fields = (
        "name",
    )


@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "release_year",
        "language",
        "maturity_rating",
        "is_featured",
        "is_published",
        "view_count",
    )

    list_filter = (
        "language",
        "maturity_rating",
        "is_featured",
        "is_published",
        "genres",
    )

    search_fields = (
        "title",
        "description",
    )

    prepopulated_fields = {
        "slug": ("title",)
    }

    filter_horizontal = (
        "genres",
        "cast",
        "directors",
    )


@admin.register(TVShow)
class TVShowAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "title",
        "release_year",
        "language",
        "maturity_rating",
        "is_featured",
        "is_published",
        "view_count",
    )

    list_filter = (
        "language",
        "maturity_rating",
        "is_featured",
        "is_published",
        "genres",
    )

    search_fields = (
        "title",
        "description",
    )

    prepopulated_fields = {
        "slug": ("title",)
    }

    filter_horizontal = (
        "genres",
        "cast",
        "directors",
    )


@admin.register(Season)
class SeasonAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "show",
        "season_number",
        "title",
    )

    list_filter = (
        "show",
    )

    search_fields = (
        "show__title",
        "title",
    )


@admin.register(Episode)
class EpisodeAdmin(admin.ModelAdmin):

    list_display = (
        "id",
        "season",
        "episode_number",
        "title",
        "duration",
        "is_published",
        "view_count",
    )

    list_filter = (
        "is_published",
        "season__show",
    )

    search_fields = (
        "title",
        "description",
        "season__show__title",
    )