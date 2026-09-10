from django.contrib.contenttypes.models import ContentType

from rest_framework import serializers

from apps.catalog.models import Movie, TVShow

from .models import MyList


# ============================================================
# MY LIST SERIALIZER
# ============================================================

class MyListSerializer(serializers.ModelSerializer):

    # ========================================================
    # WRITE INPUTS
    # ========================================================

    content_type = serializers.ChoiceField(
        choices=[
            ("movie", "Movie"),
            ("show", "TV Show"),
        ],
        write_only=True,
    )

    content_id = serializers.IntegerField(
        write_only=True,
    )

    profile_id = serializers.IntegerField(
        write_only=True,
        required=True,
    )

    # ========================================================
    # READ OUTPUTS
    # ========================================================

    content_type_display = serializers.SerializerMethodField()

    title = serializers.SerializerMethodField()

    poster_url = serializers.SerializerMethodField()

    # ========================================================
    # META
    # ========================================================

    class Meta:

        model = MyList

        fields = [
            "id",
            "profile_id",
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

    # ========================================================
    # VALIDATION
    # ========================================================

    def validate(self, attrs):

        profile = self.context["profile"]

        content_type = attrs.get("content_type")

        content_id = attrs.get("content_id")

        # ----------------------------------------------------
        # MOVIE
        # ----------------------------------------------------

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

        # ----------------------------------------------------
        # TV SHOW
        # ----------------------------------------------------

        elif content_type == "show":

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

        else:

            raise serializers.ValidationError({
                "content_type": "Invalid content type."
            })

        # ----------------------------------------------------
        # DJANGO CONTENT TYPE
        # ----------------------------------------------------

        django_content_type = (
            ContentType.objects.get_for_model(model)
        )

        # ----------------------------------------------------
        # DUPLICATE CHECK
        # ----------------------------------------------------

        if MyList.objects.filter(
            profile=profile,
            content_type=django_content_type,
            object_id=content.id,
        ).exists():

            raise serializers.ValidationError({
                "content": "Already in My List."
            })

        # ----------------------------------------------------
        # INTERNAL VALUES
        # ----------------------------------------------------

        attrs["_content"] = content

        attrs["_content_type"] = django_content_type

        return attrs

    # ========================================================
    # CREATE
    # ========================================================

    def create(self, validated_data):

        content = validated_data.pop(
            "_content"
        )

        django_content_type = validated_data.pop(
            "_content_type"
        )

        # profile_id is only an API input.
        # Actual profile comes from serializer context.
        validated_data.pop(
            "profile_id",
            None,
        )

        # content_type/content_id are API inputs only.
        validated_data.pop(
            "content_type",
            None,
        )

        validated_data.pop(
            "content_id",
            None,
        )

        profile = self.context["profile"]

        return MyList.objects.create(
            profile=profile,
            content_type=django_content_type,
            object_id=content.id,
        )

    # ========================================================
    # CONTENT TYPE DISPLAY
    # ========================================================

    def get_content_type_display(self, obj):

        content = obj.content

        if isinstance(content, Movie):

            return "movie"

        if isinstance(content, TVShow):

            return "show"

        return None

    # ========================================================
    # TITLE
    # ========================================================

    def get_title(self, obj):

        content = obj.content

        if content:

            return content.title

        return None

    # ========================================================
    # POSTER URL
    # ========================================================

    def get_poster_url(self, obj):

        content = obj.content

        if not content:

            return None

        poster = getattr(
            content,
            "poster",
            None,
        )

        if not poster:

            return None

        request = self.context.get(
            "request"
        )

        if request:

            return request.build_absolute_uri(
                poster.url
            )

        return poster.url

    # ========================================================
    # FINAL REPRESENTATION
    # ========================================================

    def to_representation(self, instance):

        data = super().to_representation(
            instance
        )

        # ----------------------------------------------------
        # ACTUAL OBJECT ID
        # ----------------------------------------------------

        data["content_id"] = instance.object_id

        # ----------------------------------------------------
        # ACTUAL CONTENT TYPE
        # ----------------------------------------------------

        content_type = instance.content_type

        if content_type:

            model_name = content_type.model

            if model_name == "movie":

                data["content_type"] = "movie"

            elif model_name == "tvshow":

                data["content_type"] = "show"

            else:

                data["content_type"] = model_name

        else:

            data["content_type"] = None

        return data