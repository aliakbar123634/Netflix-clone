# from rest_framework import serializers

# from .models import (
#     Genre,
#     Person,
#     Movie,
#     TVShow,
#     Season,
#     Episode,
# )


# class GenreSerializer(serializers.ModelSerializer):

#     class Meta:
#         model = Genre

#         fields = [
#             "id",
#             "name",
#             "slug",
#         ]

#         read_only_fields = [
#             "id",
#             "slug",
#         ]


# class PersonSerializer(serializers.ModelSerializer):

#     photo_url = serializers.SerializerMethodField()

#     class Meta:
#         model = Person

#         fields = [
#             "id",
#             "name",
#             "photo",
#             "photo_url",
#             "bio",
#             "birth_date",
#         ]

#         read_only_fields = [
#             "id",
#             "photo_url",
#         ]

#     def get_photo_url(self, obj):

#         request = self.context.get("request")

#         if not obj.photo:
#             return None

#         if request:
#             return request.build_absolute_uri(
#                 obj.photo.url
#             )

#         return obj.photo.url


# class MovieSerializer(serializers.ModelSerializer):

#     poster_url = serializers.SerializerMethodField()
#     backdrop_url = serializers.SerializerMethodField()

#     genres = GenreSerializer(
#         many=True,
#         read_only=True
#     )

#     cast = PersonSerializer(
#         many=True,
#         read_only=True
#     )

#     directors = PersonSerializer(
#         many=True,
#         read_only=True
#     )

#     genre_ids = serializers.PrimaryKeyRelatedField(
#         source="genres",
#         many=True,
#         queryset=Genre.objects.all(),
#         write_only=True,
#         required=False
#     )

#     cast_ids = serializers.PrimaryKeyRelatedField(
#         source="cast",
#         many=True,
#         queryset=Person.objects.all(),
#         write_only=True,
#         required=False
#     )

#     director_ids = serializers.PrimaryKeyRelatedField(
#         source="directors",
#         many=True,
#         queryset=Person.objects.all(),
#         write_only=True,
#         required=False
#     )

#     class Meta:
#         model = Movie

#         fields = [
#             "id",
#             "title",
#             "slug",
#             "description",
#             "poster",
#             "poster_url",
#             "backdrop",
#             "backdrop_url",
#             "trailer_url",
#             "video_url",
#             "release_year",
#             "duration",
#             "maturity_rating",
#             "language",
#             "genres",
#             "genre_ids",
#             "cast",
#             "cast_ids",
#             "directors",
#             "director_ids",
#             "is_featured",
#             "is_published",
#             "view_count",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "slug",
#             "poster_url",
#             "backdrop_url",
#             "view_count",
#             "created_at",
#             "updated_at",
#         ]


# class EpisodeSerializer(serializers.ModelSerializer):

#     thumbnail_url = serializers.SerializerMethodField()

#     class Meta:
#         model = Episode

#         fields = [
#             "id",
#             "season",
#             "episode_number",
#             "title",
#             "description",
#             "thumbnail",
#             "thumbnail_url",
#             "video_url",
#             "trailer_url",
#             "duration",
#             "release_date",
#             "is_published",
#             "view_count",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "thumbnail_url",
#             "view_count",
#             "created_at",
#             "updated_at",
#         ]

#     def get_thumbnail_url(self, obj):

#         request = self.context.get("request")

#         if not obj.thumbnail:
#             return None

#         if request:
#             return request.build_absolute_uri(
#                 obj.thumbnail.url
#             )

#         return obj.thumbnail.url


# class SeasonSerializer(serializers.ModelSerializer):

#     episodes = EpisodeSerializer(
#         many=True,
#         read_only=True
#     )

#     class Meta:
#         model = Season

#         fields = [
#             "id",
#             "show",
#             "season_number",
#             "title",
#             "description",
#             "poster",
#             "episodes",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "episodes",
#             "created_at",
#             "updated_at",
#         ]


# class TVShowSerializer(serializers.ModelSerializer):

#     poster_url = serializers.SerializerMethodField()
#     backdrop_url = serializers.SerializerMethodField()

#     genres = GenreSerializer(
#         many=True,
#         read_only=True
#     )

#     cast = PersonSerializer(
#         many=True,
#         read_only=True
#     )

#     directors = PersonSerializer(
#         many=True,
#         read_only=True
#     )

#     seasons = SeasonSerializer(
#         many=True,
#         read_only=True
#     )

#     genre_ids = serializers.PrimaryKeyRelatedField(
#         source="genres",
#         many=True,
#         queryset=Genre.objects.all(),
#         write_only=True,
#         required=False
#     )

#     cast_ids = serializers.PrimaryKeyRelatedField(
#         source="cast",
#         many=True,
#         queryset=Person.objects.all(),
#         write_only=True,
#         required=False
#     )

#     director_ids = serializers.PrimaryKeyRelatedField(
#         source="directors",
#         many=True,
#         queryset=Person.objects.all(),
#         write_only=True,
#         required=False
#     )

#     class Meta:
#         model = TVShow

#         fields = [
#             "id",
#             "title",
#             "slug",
#             "description",
#             "poster",
#             "poster_url",
#             "backdrop",
#             "backdrop_url",
#             "trailer_url",
#             "release_year",
#             "maturity_rating",
#             "language",
#             "genres",
#             "genre_ids",
#             "cast",
#             "cast_ids",
#             "directors",
#             "director_ids",
#             "seasons",
#             "is_featured",
#             "is_published",
#             "view_count",
#             "created_at",
#             "updated_at",
#         ]

#         read_only_fields = [
#             "id",
#             "slug",
#             "poster_url",
#             "backdrop_url",
#             "seasons",
#             "view_count",
#             "created_at",
#             "updated_at",
#         ]



from rest_framework import serializers

from .models import (
    Genre,
    Person,
    Movie,
    TVShow,
    Season,
    Episode,
)


class GenreSerializer(serializers.ModelSerializer):

    class Meta:
        model = Genre

        fields = [
            "id",
            "name",
            "slug",
        ]

        read_only_fields = [
            "id",
            "slug",
        ]


class PersonSerializer(serializers.ModelSerializer):

    photo_url = serializers.SerializerMethodField()

    class Meta:
        model = Person

        fields = [
            "id",
            "name",
            "photo",
            "photo_url",
            "bio",
            "birth_date",
        ]

        read_only_fields = [
            "id",
            "photo_url",
        ]

    def get_photo_url(self, obj):

        request = self.context.get("request")

        if not obj.photo:
            return None

        if request:
            return request.build_absolute_uri(
                obj.photo.url
            )

        return obj.photo.url


class MovieSerializer(serializers.ModelSerializer):

    poster_url = serializers.SerializerMethodField()
    backdrop_url = serializers.SerializerMethodField()

    genres = GenreSerializer(
        many=True,
        read_only=True
    )

    cast = PersonSerializer(
        many=True,
        read_only=True
    )

    directors = PersonSerializer(
        many=True,
        read_only=True
    )

    genre_ids = serializers.PrimaryKeyRelatedField(
        source="genres",
        many=True,
        queryset=Genre.objects.all(),
        write_only=True,
        required=False
    )

    cast_ids = serializers.PrimaryKeyRelatedField(
        source="cast",
        many=True,
        queryset=Person.objects.all(),
        write_only=True,
        required=False
    )

    director_ids = serializers.PrimaryKeyRelatedField(
        source="directors",
        many=True,
        queryset=Person.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = Movie

        fields = [
            "id",
            "title",
            "slug",
            "description",
            "poster",
            "poster_url",
            "backdrop",
            "backdrop_url",
            "trailer_url",
            "video_url",
            "release_year",
            "duration",
            "maturity_rating",
            "language",
            "genres",
            "genre_ids",
            "cast",
            "cast_ids",
            "directors",
            "director_ids",
            "is_featured",
            "is_published",
            "view_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "poster_url",
            "backdrop_url",
            "view_count",
            "created_at",
            "updated_at",
        ]

    def get_poster_url(self, obj):

        request = self.context.get("request")

        if not obj.poster:
            return None

        if request:
            return request.build_absolute_uri(
                obj.poster.url
            )

        return obj.poster.url

    def get_backdrop_url(self, obj):

        request = self.context.get("request")

        if not obj.backdrop:
            return None

        if request:
            return request.build_absolute_uri(
                obj.backdrop.url
            )

        return obj.backdrop.url


class EpisodeSerializer(serializers.ModelSerializer):

    thumbnail_url = serializers.SerializerMethodField()

    class Meta:
        model = Episode

        fields = [
            "id",
            "season",
            "episode_number",
            "title",
            "description",
            "thumbnail",
            "thumbnail_url",
            "video_url",
            "trailer_url",
            "duration",
            "release_date",
            "is_published",
            "view_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "thumbnail_url",
            "view_count",
            "created_at",
            "updated_at",
        ]

    def get_thumbnail_url(self, obj):

        request = self.context.get("request")

        if not obj.thumbnail:
            return None

        if request:
            return request.build_absolute_uri(
                obj.thumbnail.url
            )

        return obj.thumbnail.url


class SeasonSerializer(serializers.ModelSerializer):

    episodes = EpisodeSerializer(
        many=True,
        read_only=True
    )

    class Meta:
        model = Season

        fields = [
            "id",
            "show",
            "season_number",
            "title",
            "description",
            "poster",
            "episodes",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "episodes",
            "created_at",
            "updated_at",
        ]


class TVShowSerializer(serializers.ModelSerializer):

    poster_url = serializers.SerializerMethodField()
    backdrop_url = serializers.SerializerMethodField()

    genres = GenreSerializer(
        many=True,
        read_only=True
    )

    cast = PersonSerializer(
        many=True,
        read_only=True
    )

    directors = PersonSerializer(
        many=True,
        read_only=True
    )

    seasons = SeasonSerializer(
        many=True,
        read_only=True
    )

    genre_ids = serializers.PrimaryKeyRelatedField(
        source="genres",
        many=True,
        queryset=Genre.objects.all(),
        write_only=True,
        required=False
    )

    cast_ids = serializers.PrimaryKeyRelatedField(
        source="cast",
        many=True,
        queryset=Person.objects.all(),
        write_only=True,
        required=False
    )

    director_ids = serializers.PrimaryKeyRelatedField(
        source="directors",
        many=True,
        queryset=Person.objects.all(),
        write_only=True,
        required=False
    )

    class Meta:
        model = TVShow

        fields = [
            "id",
            "title",
            "slug",
            "description",
            "poster",
            "poster_url",
            "backdrop",
            "backdrop_url",
            "trailer_url",
            "release_year",
            "maturity_rating",
            "language",
            "genres",
            "genre_ids",
            "cast",
            "cast_ids",
            "directors",
            "director_ids",
            "seasons",
            "is_featured",
            "is_published",
            "view_count",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "slug",
            "poster_url",
            "backdrop_url",
            "seasons",
            "view_count",
            "created_at",
            "updated_at",
        ]

    def get_poster_url(self, obj):

        request = self.context.get("request")

        if not obj.poster:
            return None

        if request:
            return request.build_absolute_uri(
                obj.poster.url
            )

        return obj.poster.url

    def get_backdrop_url(self, obj):

        request = self.context.get("request")

        if not obj.backdrop:
            return None

        if request:
            return request.build_absolute_uri(
                obj.backdrop.url
            )

        return obj.backdrop.url