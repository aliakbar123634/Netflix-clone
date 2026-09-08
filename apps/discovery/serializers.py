from rest_framework import serializers

from apps.catalog.models import (
    Movie,
    TVShow,
    Genre,
)

from apps.catalog.serializers import (
    MovieSerializer,
    TVShowSerializer,
)


class SearchResultSerializer(serializers.Serializer):

    movies = MovieSerializer(
        many=True
    )

    shows = TVShowSerializer(
        many=True
    )


class HomeSectionSerializer(serializers.Serializer):

    title = serializers.CharField()

    content_type = serializers.CharField()

    items = serializers.ListField()


class HomeSerializer(serializers.Serializer):

    hero = serializers.DictField(
        allow_null=True
    )

    continue_watching = serializers.ListField()

    my_list = serializers.ListField()

    trending = serializers.ListField()

    popular = serializers.ListField()

    new_releases = serializers.ListField()

    genres = serializers.ListField()