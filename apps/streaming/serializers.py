from rest_framework import serializers

from apps.catalog.models import (
    Movie,
    Episode,
)


# ============================================================
# MOVIE PLAYBACK SERIALIZER
# ============================================================

class MoviePlaybackSerializer(
    serializers.ModelSerializer
):

    content_type = serializers.SerializerMethodField()

    duration_seconds = serializers.SerializerMethodField()

    poster_url = serializers.SerializerMethodField()

    backdrop_url = serializers.SerializerMethodField()

    class Meta:

        model = Movie

        fields = [
            "id",
            "title",
            "description",

            "duration",
            "duration_seconds",

            "video_url",

            "poster",
            "poster_url",

            "backdrop",
            "backdrop_url",

            "maturity_rating",
            "language",
            "release_year",

            "content_type",
        ]

        read_only_fields = [
            "id",
            "duration_seconds",
            "poster_url",
            "backdrop_url",
            "content_type",
        ]


    # ========================================================
    # CONTENT TYPE
    # ========================================================

    def get_content_type(
        self,
        obj
    ):

        return "movie"


    # ========================================================
    # DURATION
    # ========================================================

    def get_duration_seconds(
        self,
        obj
    ):

        return int(
            (obj.duration or 0) * 60
        )


    # ========================================================
    # POSTER URL
    # ========================================================

    def get_poster_url(
        self,
        obj
    ):

        if not obj.poster:
            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                obj.poster.url
            )

        return obj.poster.url


    # ========================================================
    # BACKDROP URL
    # ========================================================

    def get_backdrop_url(
        self,
        obj
    ):

        if not obj.backdrop:
            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                obj.backdrop.url
            )

        return obj.backdrop.url


# ============================================================
# EPISODE PLAYBACK SERIALIZER
# ============================================================

class EpisodePlaybackSerializer(
    serializers.ModelSerializer
):

    content_type = serializers.SerializerMethodField()

    duration_seconds = serializers.SerializerMethodField()

    thumbnail_url = serializers.SerializerMethodField()

    class Meta:

        model = Episode

        fields = [
            "id",

            "season",
            "episode_number",

            "title",
            "description",

            "duration",
            "duration_seconds",

            "video_url",

            "thumbnail",
            "thumbnail_url",

            "trailer_url",

            "release_date",

            "content_type",
        ]

        read_only_fields = [
            "id",
            "duration_seconds",
            "thumbnail_url",
            "content_type",
        ]


    # ========================================================
    # CONTENT TYPE
    # ========================================================

    def get_content_type(
        self,
        obj
    ):

        return "episode"


    # ========================================================
    # DURATION
    # ========================================================

    def get_duration_seconds(
        self,
        obj
    ):

        return int(
            (obj.duration or 0) * 60
        )


    # ========================================================
    # THUMBNAIL URL
    # ========================================================

    def get_thumbnail_url(
        self,
        obj
    ):

        if not obj.thumbnail:
            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                obj.thumbnail.url
            )

        return obj.thumbnail.url