from django.db.models import Count, Q

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response

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


# ============================================================
# SIMILAR CONTENT HELPERS
# ============================================================

def get_similar_content(
    source_content,
    profile=None,
    limit=12,
):
    """
    Return similar movies and TV shows based on genres.

    The source content itself is excluded.
    Published content only.
    """

    source_genre_ids = list(
        source_content.genres.values_list(
            "id",
            flat=True,
        )
    )

    if not source_genre_ids:
        return [], []

    # --------------------------------------------------------
    # MOVIES
    # --------------------------------------------------------

    movie_queryset = (
        Movie.objects
        .filter(
            is_published=True,
            genres__id__in=source_genre_ids,
        )
        .exclude(
            id=source_content.id
        )
        .annotate(
            matching_genres=Count(
                "genres",
                filter=Q(
                    genres__id__in=source_genre_ids
                ),
                distinct=True,
            )
        )
        .order_by(
            "-matching_genres",
            "-view_count",
            "-created_at",
        )
        .distinct()
        .prefetch_related(
            "genres",
            "cast",
            "directors",
        )
    )

    # --------------------------------------------------------
    # TV SHOWS
    # --------------------------------------------------------

    show_queryset = (
        TVShow.objects
        .filter(
            is_published=True,
            genres__id__in=source_genre_ids,
        )
        .exclude(
            id=source_content.id
        )
        .annotate(
            matching_genres=Count(
                "genres",
                filter=Q(
                    genres__id__in=source_genre_ids
                ),
                distinct=True,
            )
        )
        .order_by(
            "-matching_genres",
            "-view_count",
            "-created_at",
        )
        .distinct()
        .prefetch_related(
            "genres",
            "cast",
            "directors",
            "seasons__episodes",
        )
    )

    # --------------------------------------------------------
    # OPTIONAL MATURITY FILTER
    # --------------------------------------------------------

    if profile:

        maturity_levels = {
            "all": 0,
            "7+": 7,
            "13+": 13,
            "16+": 16,
            "18+": 18,
        }

        if profile.is_kids:
            max_age = 7
        else:
            max_age = maturity_levels.get(
                profile.maturity_level,
                18,
            )

        allowed_ratings = [
            rating
            for rating, age in maturity_levels.items()
            if age <= max_age
        ]

        movie_queryset = movie_queryset.filter(
            maturity_rating__in=allowed_ratings
        )

        show_queryset = show_queryset.filter(
            maturity_rating__in=allowed_ratings
        )

    return (
        movie_queryset[:limit],
        show_queryset[:limit],
    )


# ============================================================
# GENRE
# ============================================================

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


# ============================================================
# PERSON
# ============================================================

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


# ============================================================
# MOVIE
# ============================================================

class MovieViewSet(viewsets.ModelViewSet):

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

        queryset = (
            Movie.objects
            .all()
            .prefetch_related(
                "genres",
                "cast",
                "directors",
            )
        )

        if not self.request.user.is_staff:

            queryset = queryset.filter(
                is_published=True
            )

        return queryset

    # ========================================================
    # SIMILAR MOVIES / SHOWS
    # ========================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="similar",
    )
    def similar(self, request, pk=None):

        movie = self.get_object()

        profile = None

        profile_id = request.query_params.get(
            "profile_id"
        )

        if profile_id:

            from apps.profiles.models import Profile

            try:

                profile = Profile.objects.get(
                    id=profile_id,
                    user=request.user,
                    is_active=True,
                )

            except Profile.DoesNotExist:

                profile = None

        movies, shows = get_similar_content(
            movie,
            profile=profile,
            limit=12,
        )

        movie_data = MovieSerializer(
            movies,
            many=True,
            context={
                "request": request,
            },
        ).data

        show_data = TVShowSerializer(
            shows,
            many=True,
            context={
                "request": request,
            },
        ).data

        return Response(
            {
                "source": {
                    "type": "movie",
                    "id": movie.id,
                    "title": movie.title,
                },
                "movies": movie_data,
                "shows": show_data,
                "total": (
                    len(movie_data)
                    +
                    len(show_data)
                ),
            }
        )


# ============================================================
# TV SHOW
# ============================================================

class TVShowViewSet(viewsets.ModelViewSet):

    serializer_class = TVShowSerializer

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
        "view_count",
        "created_at",
    ]

    def get_queryset(self):

        queryset = (
            TVShow.objects
            .all()
            .prefetch_related(
                "genres",
                "cast",
                "directors",
                "seasons__episodes",
            )
        )

        if not self.request.user.is_staff:

            queryset = queryset.filter(
                is_published=True
            )

        return queryset

    # ========================================================
    # SIMILAR MOVIES / SHOWS
    # ========================================================

    @action(
        detail=True,
        methods=["get"],
        url_path="similar",
    )
    def similar(self, request, pk=None):

        show = self.get_object()

        profile = None

        profile_id = request.query_params.get(
            "profile_id"
        )

        if profile_id:

            from apps.profiles.models import Profile

            try:

                profile = Profile.objects.get(
                    id=profile_id,
                    user=request.user,
                    is_active=True,
                )

            except Profile.DoesNotExist:

                profile = None

        movies, shows = get_similar_content(
            show,
            profile=profile,
            limit=12,
        )

        movie_data = MovieSerializer(
            movies,
            many=True,
            context={
                "request": request,
            },
        ).data

        show_data = TVShowSerializer(
            shows,
            many=True,
            context={
                "request": request,
            },
        ).data

        return Response(
            {
                "source": {
                    "type": "show",
                    "id": show.id,
                    "title": show.title,
                },
                "movies": movie_data,
                "shows": show_data,
                "total": (
                    len(movie_data)
                    +
                    len(show_data)
                ),
            }
        )


# ============================================================
# SEASON
# ============================================================

class SeasonViewSet(viewsets.ModelViewSet):

    queryset = (
        Season.objects
        .all()
        .prefetch_related(
            "episodes"
        )
    )

    serializer_class = SeasonSerializer

    permission_classes = [
        IsAdminOrReadOnly
    ]


# ============================================================
# EPISODE
# ============================================================

class EpisodeViewSet(viewsets.ModelViewSet):

    queryset = (
        Episode.objects
        .all()
        .select_related(
            "season",
            "season__show",
        )
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