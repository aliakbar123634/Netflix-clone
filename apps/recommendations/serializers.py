from rest_framework import serializers

from apps.catalog.serializers import (
    MovieSerializer,
    TVShowSerializer,
)


class RecommendationSerializer(
    serializers.Serializer
):

    movies = MovieSerializer(
        many=True
    )

    shows = TVShowSerializer(
        many=True
    )

    based_on = serializers.ListField(
        child=serializers.CharField()
    )