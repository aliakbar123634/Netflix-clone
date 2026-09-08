from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.catalog.models import Movie, Episode

from .models import (
    WatchProgress,
    WatchHistory,
)


class WatchProgressSerializer(serializers.ModelSerializer):

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

    title = serializers.SerializerMethodField()

    poster_url = serializers.SerializerMethodField()

    progress_percentage = serializers.SerializerMethodField()

    class Meta:

        model = WatchProgress

        fields = [
            "id",
            "content_type",
            "content_id",
            "title",
            "poster_url",
            "position",
            "duration",
            "progress_percentage",
            "completed",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "title",
            "poster_url",
            "progress_percentage",
            "updated_at",
        ]

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

                content = Episode.objects.get(
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

        django_content_type = ContentType.objects.get_for_model(
            model
        )

        attrs["_content"] = content
        attrs["_content_type"] = django_content_type
        attrs["_profile"] = profile

        return attrs

    def create(self, validated_data):

        content = validated_data.pop("_content")
        content_type = validated_data.pop("_content_type")
        profile = validated_data.pop("_profile")

        validated_data.pop("content_type", None)
        validated_data.pop("content_id", None)

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

        progress, created = WatchProgress.objects.update_or_create(

            profile=profile,

            content_type=content_type,

            object_id=content.id,

            defaults={
                "position": position,
                "duration": duration,
                "completed": completed,
            }
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

    def get_title(self, obj):

        if obj.content:
            return obj.content.title

        return None

    def get_poster_url(self, obj):

        if not obj.content:
            return None

        image = None

        if isinstance(obj.content, Movie):

            image = obj.content.poster

        elif isinstance(obj.content, Episode):

            image = obj.content.thumbnail

        if not image:
            return None

        request = self.context.get("request")

        if request:

            return request.build_absolute_uri(
                image.url
            )

        return image.url

    def get_progress_percentage(self, obj):

        if not obj.duration:
            return 0

        percentage = (
            obj.position / obj.duration
        ) * 100

        return round(
            min(percentage, 100),
            2
        )