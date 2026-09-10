from django.contrib.contenttypes.models import ContentType

from rest_framework import serializers

from apps.catalog.models import Movie, Episode

from .models import (
    WatchProgress,
    WatchHistory,
)


class WatchProgressSerializer(serializers.ModelSerializer):

    # ============================================================
    # WRITE FIELDS
    # ============================================================

    content_type = serializers.ChoiceField(
        choices=[
            ("movie", "Movie"),
            ("episode", "Episode"),
        ],
        write_only=True,
    )

    content_id = serializers.IntegerField(
        write_only=True
    )

    profile_id = serializers.IntegerField(
        write_only=True
    )

    # ============================================================
    # RESPONSE FIELDS
    # ============================================================

    content_type_display = serializers.SerializerMethodField()

    title = serializers.SerializerMethodField()

    poster_url = serializers.SerializerMethodField()

    backdrop_url = serializers.SerializerMethodField()

    release_year = serializers.SerializerMethodField()

    maturity_rating = serializers.SerializerMethodField()

    duration_minutes = serializers.SerializerMethodField()

    show_id = serializers.SerializerMethodField()

    show_title = serializers.SerializerMethodField()

    season_number = serializers.SerializerMethodField()

    episode_number = serializers.SerializerMethodField()

    progress_percentage = serializers.SerializerMethodField()

    class Meta:

        model = WatchProgress

        fields = [
            "id",

            "content_type",
            "content_id",
            "content_type_display",

            "title",

            "poster_url",
            "backdrop_url",

            "release_year",
            "maturity_rating",
            "duration_minutes",

            "show_id",
            "show_title",

            "season_number",
            "episode_number",

            "position",
            "duration",
            "progress_percentage",
            "completed",

            "updated_at",
        ]

        read_only_fields = [
            "id",
            "content_type_display",
            "title",
            "poster_url",
            "backdrop_url",
            "release_year",
            "maturity_rating",
            "duration_minutes",
            "show_id",
            "show_title",
            "season_number",
            "episode_number",
            "progress_percentage",
            "updated_at",
        ]

    # ============================================================
    # VALIDATION
    # ============================================================

    def validate(self, attrs):

        content_type = attrs["content_type"]

        content_id = attrs["content_id"]

        profile = self.context["profile"]

        if content_type == "movie":

            try:

                content = Movie.objects.get(
                    id=content_id,
                    is_published=True,
                )

                model = Movie

            except Movie.DoesNotExist:

                raise serializers.ValidationError({
                    "content_id": "Movie not found."
                })

        else:

            try:

                content = Episode.objects.select_related(
                    "season__show"
                ).get(
                    id=content_id,
                    is_published=True,
                )

                model = Episode

            except Episode.DoesNotExist:

                raise serializers.ValidationError({
                    "content_id": "Episode not found."
                })

        position = attrs.get(
            "position",
            0
        )

        duration = attrs.get(
            "duration",
            0
        )

        if position < 0:

            raise serializers.ValidationError({
                "position": "Position cannot be negative."
            })

        if duration <= 0:

            raise serializers.ValidationError({
                "duration": "Duration must be greater than zero."
            })

        if position > duration:

            raise serializers.ValidationError({
                "position": "Position cannot exceed duration."
            })

        django_content_type = (
            ContentType.objects.get_for_model(
                model
            )
        )

        attrs["_content"] = content

        attrs["_content_type"] = (
            django_content_type
        )

        attrs["_profile"] = profile

        return attrs

    # ============================================================
    # CREATE / UPDATE PROGRESS
    # ============================================================

    def create(
        self,
        validated_data
    ):

        content = validated_data.pop(
            "_content"
        )

        content_type = validated_data.pop(
            "_content_type"
        )

        profile = validated_data.pop(
            "_profile"
        )

        validated_data.pop(
            "content_type",
            None
        )

        validated_data.pop(
            "content_id",
            None
        )

        position = validated_data.get(
            "position",
            0
        )

        duration = validated_data.get(
            "duration",
            0
        )

        completed = (
            position >= duration * 0.90
        )

        progress, created = (
            WatchProgress.objects.update_or_create(

                profile=profile,

                content_type=content_type,

                object_id=content.id,

                defaults={
                    "position": position,
                    "duration": duration,
                    "completed": completed,
                }
            )
        )

        WatchHistory.objects.update_or_create(

            profile=profile,

            content_type=content_type,

            object_id=content.id,

            defaults={
                "completed": completed,
            }
        )

        return progress

    # ============================================================
    # CONTENT HELPERS
    # ============================================================

    def get_content_type_display(
        self,
        obj
    ):

        if isinstance(
            obj.content,
            Movie
        ):

            return "movie"

        if isinstance(
            obj.content,
            Episode
        ):

            return "episode"

        return None

    def get_title(
        self,
        obj
    ):

        if obj.content:

            return obj.content.title

        return None

    def get_poster_url(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        image = None

        if isinstance(
            content,
            Movie
        ):

            image = content.poster

        elif isinstance(
            content,
            Episode
        ):

            image = content.thumbnail

        if not image:

            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                image.url
            )

        return image.url

    def get_backdrop_url(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        image = None

        if isinstance(
            content,
            Movie
        ):

            image = content.backdrop

        elif isinstance(
            content,
            Episode
        ):

            if content.season_id:

                image = (
                    content.season.show.backdrop
                )

        if not image:

            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                image.url
            )

        return image.url

    def get_release_year(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        if isinstance(
            content,
            Movie
        ):

            return content.release_year

        if isinstance(
            content,
            Episode
        ):

            return content.season.show.release_year

        return None

    def get_maturity_rating(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        if isinstance(
            content,
            Movie
        ):

            return content.maturity_rating

        if isinstance(
            content,
            Episode
        ):

            return content.season.show.maturity_rating

        return None

    def get_duration_minutes(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        if isinstance(
            content,
            Movie
        ):

            return content.duration

        if isinstance(
            content,
            Episode
        ):

            return content.duration

        return None

    def get_show_id(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.season.show_id

        return None

    def get_show_title(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.season.show.title

        return None

    def get_season_number(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.season.season_number

        return None

    def get_episode_number(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.episode_number

        return None

    def get_progress_percentage(
        self,
        obj
    ):

        if not obj.duration:

            return 0

        percentage = (
            obj.position /
            obj.duration
        ) * 100

        return round(
            min(
                percentage,
                100
            ),
            2
        )

    # ============================================================
    # FINAL REPRESENTATION
    # ============================================================

    def to_representation(
        self,
        instance
    ):

        data = super().to_representation(
            instance
        )

        data["content_id"] = (
            instance.object_id
        )

        data["content_type"] = (
            self.get_content_type_display(
                instance
            )
        )

        return data


class WatchHistorySerializer(
    serializers.ModelSerializer
):

    content_type = serializers.SerializerMethodField()

    content_id = serializers.SerializerMethodField()

    title = serializers.SerializerMethodField()

    poster_url = serializers.SerializerMethodField()

    backdrop_url = serializers.SerializerMethodField()

    release_year = serializers.SerializerMethodField()

    maturity_rating = serializers.SerializerMethodField()

    duration_minutes = serializers.SerializerMethodField()

    show_id = serializers.SerializerMethodField()

    show_title = serializers.SerializerMethodField()

    season_number = serializers.SerializerMethodField()

    episode_number = serializers.SerializerMethodField()

    class Meta:

        model = WatchHistory

        fields = [
            "id",

            "content_type",
            "content_id",

            "title",

            "poster_url",
            "backdrop_url",

            "release_year",
            "maturity_rating",
            "duration_minutes",

            "show_id",
            "show_title",

            "season_number",
            "episode_number",

            "completed",
            "watched_at",
        ]

        read_only_fields = fields

    def get_content_type(
        self,
        obj
    ):

        if isinstance(
            obj.content,
            Movie
        ):

            return "movie"

        if isinstance(
            obj.content,
            Episode
        ):

            return "episode"

        return None

    def get_content_id(
        self,
        obj
    ):

        return obj.object_id

    def get_title(
        self,
        obj
    ):

        if obj.content:

            return obj.content.title

        return None

    def _get_image_url(
        self,
        image
    ):

        if not image:

            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                image.url
            )

        return image.url

    def get_poster_url(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        if isinstance(
            content,
            Movie
        ):

            return self._get_image_url(
                content.poster
            )

        if isinstance(
            content,
            Episode
        ):

            return self._get_image_url(
                content.thumbnail
            )

        return None

    def get_backdrop_url(
        self,
        obj
    ):

        content = obj.content

        if not content:

            return None

        if isinstance(
            content,
            Movie
        ):

            return self._get_image_url(
                content.backdrop
            )

        if isinstance(
            content,
            Episode
        ):

            return self._get_image_url(
                content.season.show.backdrop
            )

        return None

    def get_release_year(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Movie
        ):

            return content.release_year

        if isinstance(
            content,
            Episode
        ):

            return content.season.show.release_year

        return None

    def get_maturity_rating(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Movie
        ):

            return content.maturity_rating

        if isinstance(
            content,
            Episode
        ):

            return content.season.show.maturity_rating

        return None

    def get_duration_minutes(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Movie
        ):

            return content.duration

        if isinstance(
            content,
            Episode
        ):

            return content.duration

        return None

    def get_show_id(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.season.show_id

        return None

    def get_show_title(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.season.show.title

        return None

    def get_season_number(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.season.season_number

        return None

    def get_episode_number(
        self,
        obj
    ):

        content = obj.content

        if isinstance(
            content,
            Episode
        ):

            return content.episode_number

        return None