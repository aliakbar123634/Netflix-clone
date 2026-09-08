from django.contrib.contenttypes.models import ContentType
from rest_framework import serializers

from apps.catalog.models import Movie, TVShow

from .models import MyList


class MyListSerializer(serializers.ModelSerializer):

    content_type = serializers.ChoiceField(
        choices=[
            ("movie", "Movie"),
            ("show", "TV Show"),
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

    content_type_display = serializers.SerializerMethodField()

    poster_url = serializers.SerializerMethodField()

    class Meta:
        model = MyList

        fields = [
            "id",
            "content_type",
            "content_id",
            "content_type_display",
            "title",
            "poster_url",
            "created_at",
        ]

        read_only_fields = [
            "id",
            "content_type_display",
            "title",
            "poster_url",
            "created_at",
        ]

    def validate(self, attrs):

        profile = self.context["profile"]

        content_type = attrs["content_type"]
        content_id = attrs["content_id"]

        if content_type == "movie":

            try:
                content = Movie.objects.get(
                    id=content_id,
                    is_published=True,
                )

            except Movie.DoesNotExist:
                raise serializers.ValidationError({
                    "content_id": "Movie not found."
                })

            model = Movie

        else:

            try:
                content = TVShow.objects.get(
                    id=content_id,
                    is_published=True,
                )

            except TVShow.DoesNotExist:
                raise serializers.ValidationError({
                    "content_id": "TV show not found."
                })

            model = TVShow

        django_content_type = ContentType.objects.get_for_model(
            model
        )

        if MyList.objects.filter(
            profile=profile,
            content_type=django_content_type,
            object_id=content.id,
        ).exists():

            raise serializers.ValidationError({
                "content": "Already in My List."
            })

        attrs["_content"] = content
        attrs["_content_type"] = django_content_type

        return attrs

    def create(self, validated_data):

        content = validated_data.pop("_content")
        content_type = validated_data.pop("_content_type")
        validated_data.pop("profile_id", None)

        profile = self.context["profile"]

        return MyList.objects.create(
            profile=profile,
            content_type=content_type,
            object_id=content.id,
        )

    def get_content_type_display(self, obj):

        if isinstance(obj.content, Movie):
            return "movie"

        if isinstance(obj.content, TVShow):
            return "show"

        return None

    def get_title(self, obj):

        if obj.content:
            return obj.content.title

        return None

    def get_poster_url(self, obj):

        if not obj.content:
            return None

        poster = getattr(
            obj.content,
            "poster",
            None
        )

        if not poster:
            return None

        request = self.context.get("request")

        if request:
            return request.build_absolute_uri(
                poster.url
            )

        return poster.url