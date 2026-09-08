from rest_framework import viewsets

from .models import (
    Genre,
    Person,
    Movie,
    TVShow,
    Season,
    Episode,
)

from .serializers import (
    GenreSerializer,
    PersonSerializer,
    MovieSerializer,
    TVShowSerializer,
    SeasonSerializer,
    EpisodeSerializer,
)

from .permissions import IsAdminOrReadOnly


class GenreViewSet(viewsets.ModelViewSet):

    queryset = Genre.objects.all()
    serializer_class = GenreSerializer
    permission_classes = [
        IsAdminOrReadOnly
    ]

    search_fields = [
        "name",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]


class PersonViewSet(viewsets.ModelViewSet):

    queryset = Person.objects.all()
    serializer_class = PersonSerializer
    permission_classes = [
        IsAdminOrReadOnly
    ]

    search_fields = [
        "name",
    ]

    ordering_fields = [
        "name",
        "created_at",
    ]


class MovieViewSet(viewsets.ModelViewSet):

    queryset = Movie.objects.filter(
        is_published=True
    ).prefetch_related(
        "genres",
        "cast",
        "directors",
    )

    serializer_class = MovieSerializer
    permission_classes = [
        IsAdminOrReadOnly
    ]

    search_fields = [
        "title",
        "description",
        "genres__name",
        "cast__name",
        "directors__name",
    ]

    ordering_fields = [
        "title",
        "release_year",
        "duration",
        "view_count",
        "created_at",
    ]

    def get_queryset(self):

        queryset = Movie.objects.all().prefetch_related(
            "genres",
            "cast",
            "directors",
        )

        if not self.request.user.is_staff:
            queryset = queryset.filter(
                is_published=True
            )

        return queryset


class TVShowViewSet(viewsets.ModelViewSet):

    serializer_class = TVShowSerializer
    permission_classes = [
        IsAdminOrReadOnly
    ]

    def get_queryset(self):

        queryset = TVShow.objects.all().prefetch_related(
            "genres",
            "cast",
            "directors",
            "seasons__episodes",
        )

        if not self.request.user.is_staff:
            queryset = queryset.filter(
                is_published=True
            )

        return queryset

    search_fields = [
        "title",
        "description",
        "genres__name",
        "cast__name",
        "directors__name",
    ]

    ordering_fields = [
        "title",
        "release_year",
        "view_count",
        "created_at",
    ]


class SeasonViewSet(viewsets.ModelViewSet):

    queryset = Season.objects.all().prefetch_related(
        "episodes"
    )

    serializer_class = SeasonSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]


class EpisodeViewSet(viewsets.ModelViewSet):

    queryset = Episode.objects.all().select_related(
        "season",
        "season__show",
    )

    serializer_class = EpisodeSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]

    search_fields = [
        "title",
        "description",
        "season__show__title",
    ]

    ordering_fields = [
        "episode_number",
        "release_date",
        "view_count",
        "created_at",
    ]