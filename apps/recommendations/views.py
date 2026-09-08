from django.db.models import Count, Q

from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import (
    Movie,
    TVShow,
)

from apps.catalog.serializers import (
    MovieSerializer,
    TVShowSerializer,
)

from apps.history.models import (
    WatchHistory,
)

from apps.profiles.models import Profile


class RecommendationView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    # ============================================================
    # GET PROFILE
    # ============================================================

    def get_profile(self, request):

        profile_id = request.query_params.get(
            "profile_id"
        )

        if not profile_id:

            return None

        try:

            return Profile.objects.get(
                id=profile_id,
                user=request.user,
                is_active=True,
            )

        except Profile.DoesNotExist:

            return None

    # ============================================================
    # MATURITY FILTER
    # ============================================================

    def filter_by_maturity(
        self,
        queryset,
        profile
    ):

        maturity_levels = {
            "all": 0,
            "7+": 7,
            "13+": 13,
            "16+": 16,
            "18+": 18,
        }

        # --------------------------------------------------------
        # Kids profile
        # --------------------------------------------------------

        if profile.is_kids:

            max_age = 7

        # --------------------------------------------------------
        # Normal profile
        # --------------------------------------------------------

        else:

            max_age = maturity_levels.get(
                profile.maturity_level,
                18
            )

        # --------------------------------------------------------
        # Build allowed ratings
        # --------------------------------------------------------

        allowed = []

        for rating, age in maturity_levels.items():

            if age <= max_age:

                allowed.append(
                    rating
                )

        # --------------------------------------------------------
        # Apply filter
        # --------------------------------------------------------

        return queryset.filter(
            maturity_rating__in=allowed
        )

    # ============================================================
    # GET RECOMMENDATIONS
    # ============================================================

    def get(self, request):

        # --------------------------------------------------------
        # STEP 1
        # Get active profile
        # --------------------------------------------------------

        profile = self.get_profile(
            request
        )

        if not profile:

            return Response(
                {
                    "detail": (
                        "Valid profile_id is required."
                    )
                },
                status=400
            )

        # --------------------------------------------------------
        # STEP 2
        # Get user's watch history
        # --------------------------------------------------------

        history = WatchHistory.objects.filter(
            profile=profile
        ).select_related(
            "content_type"
        ).order_by(
            "-watched_at"
        )

        # --------------------------------------------------------
        # Resolve GenericForeignKey content
        # --------------------------------------------------------

        watched_content = []

        for history_item in history:

            content = history_item.content

            if content:

                watched_content.append(
                    content
                )

        # --------------------------------------------------------
        # STEP 3
        # Get genres from watched content
        # --------------------------------------------------------

        genre_ids = set()

        based_on = []

        for content in watched_content:

            # ----------------------------------------------------
            # Movie
            # ----------------------------------------------------

            if isinstance(
                content,
                Movie
            ):

                genres = content.genres.all()

            # ----------------------------------------------------
            # TV Show
            # ----------------------------------------------------

            elif isinstance(
                content,
                TVShow
            ):

                genres = content.genres.all()

            # ----------------------------------------------------
            # Other content
            # ----------------------------------------------------

            else:

                continue

            # ----------------------------------------------------
            # Collect genres
            # ----------------------------------------------------

            for genre in genres:

                genre_ids.add(
                    genre.id
                )

                if genre.name not in based_on:

                    based_on.append(
                        genre.name
                    )

        # ========================================================
        # STEP 4
        # NO WATCH HISTORY / NO GENRES
        # ========================================================

        if not genre_ids:

            # ----------------------------------------------------
            # Popular movies
            # ----------------------------------------------------

            movies = Movie.objects.filter(
                is_published=True
            ).order_by(
                "-view_count",
                "-created_at"
            )

            # ----------------------------------------------------
            # Apply maturity filter
            # ----------------------------------------------------

            movies = self.filter_by_maturity(
                movies,
                profile
            )[:10]

            # ----------------------------------------------------
            # Popular shows
            # ----------------------------------------------------

            shows = TVShow.objects.filter(
                is_published=True
            ).order_by(
                "-view_count",
                "-created_at"
            )

            # ----------------------------------------------------
            # Apply maturity filter
            # ----------------------------------------------------

            shows = self.filter_by_maturity(
                shows,
                profile
            )[:10]

            # ----------------------------------------------------
            # Serialize
            # ----------------------------------------------------

            movie_data = MovieSerializer(
                movies,
                many=True,
                context={
                    "request": request
                }
            ).data

            show_data = TVShowSerializer(
                shows,
                many=True,
                context={
                    "request": request
                }
            ).data

            # ----------------------------------------------------
            # Response
            # ----------------------------------------------------

            return Response({

                "strategy": "popular",

                "based_on": [],

                "movies": movie_data,

                "shows": show_data,

                "total": (
                    len(movie_data)
                    +
                    len(show_data)
                ),
            })

        # ========================================================
        # STEP 5
        # GET WATCHED MOVIE / SHOW IDS
        # ========================================================

        watched_movie_ids = []

        watched_show_ids = []

        for content in watched_content:

            # ----------------------------------------------------
            # Movie IDs
            # ----------------------------------------------------

            if isinstance(
                content,
                Movie
            ):

                watched_movie_ids.append(
                    content.id
                )

            # ----------------------------------------------------
            # TV Show IDs
            # ----------------------------------------------------

            elif isinstance(
                content,
                TVShow
            ):

                watched_show_ids.append(
                    content.id
                )

        # ========================================================
        # STEP 6
        # MOVIE RECOMMENDATIONS
        # ========================================================

        movies = Movie.objects.filter(
            is_published=True,
            genres__id__in=genre_ids,
        ).exclude(
            id__in=watched_movie_ids
        ).annotate(
            matching_genres=Count(
                "genres",
                filter=Q(
                    genres__id__in=genre_ids
                ),
                distinct=True,
            )
        ).order_by(
            "-matching_genres",
            "-view_count",
            "-created_at",
        ).distinct()

        # --------------------------------------------------------
        # Apply Kids / Maturity filter
        # --------------------------------------------------------

        movies = self.filter_by_maturity(
            movies,
            profile
        )[:20]

        # ========================================================
        # STEP 7
        # TV SHOW RECOMMENDATIONS
        # ========================================================

        shows = TVShow.objects.filter(
            is_published=True,
            genres__id__in=genre_ids,
        ).exclude(
            id__in=watched_show_ids
        ).annotate(
            matching_genres=Count(
                "genres",
                filter=Q(
                    genres__id__in=genre_ids
                ),
                distinct=True,
            )
        ).order_by(
            "-matching_genres",
            "-view_count",
            "-created_at",
        ).distinct()

        # --------------------------------------------------------
        # Apply Kids / Maturity filter
        # --------------------------------------------------------

        shows = self.filter_by_maturity(
            shows,
            profile
        )[:20]

        # ========================================================
        # STEP 8
        # SERIALIZE MOVIES
        # ========================================================

        movie_data = MovieSerializer(
            movies,
            many=True,
            context={
                "request": request
            }
        ).data

        # ========================================================
        # STEP 9
        # SERIALIZE SHOWS
        # ========================================================

        show_data = TVShowSerializer(
            shows,
            many=True,
            context={
                "request": request
            }
        ).data

        # ========================================================
        # STEP 10
        # FINAL RESPONSE
        # ========================================================

        return Response({

            "strategy": "genre_based",

            "based_on": based_on,

            "movies": movie_data,

            "shows": show_data,

            "total": (
                len(movie_data)
                +
                len(show_data)
            ),
        })