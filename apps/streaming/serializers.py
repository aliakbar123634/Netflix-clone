from rest_framework import serializers

from apps.catalog.models import (
    Movie,
    Episode,
)


class MoviePlaybackSerializer(
    serializers.ModelSerializer
):

    content_type = serializers.CharField(
        default="movie"
    )

    class Meta:

        model = Movie

        fields = [
            "id",
            "title",
            "description",
            "duration",
            "video_url",
            "poster",
            "backdrop",
            "maturity_rating",
            "language",
            "release_year",
            "content_type",
        ]


class EpisodePlaybackSerializer(
    serializers.ModelSerializer
):

    content_type = serializers.CharField(
        default="episode"
    )

    class Meta:

        model = Episode

        fields = [
            "id",
            "title",
            "description",
            "duration",
            "video_url",
            "thumbnail",
            "episode_number",
            "content_type",
        ]