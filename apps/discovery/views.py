
from django.db.models import Q

from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import (
    Movie,
    TVShow,
    Genre,
    Episode,
)

from apps.catalog.serializers import (
    MovieSerializer,
    TVShowSerializer,
)

from apps.profiles.models import Profile

from apps.watchlist.models import MyList

from apps.history.models import WatchProgress


class DiscoveryBaseView(APIView):

    permission_classes = [
        AllowAny
    ]

    MATURITY_LEVELS = {
        "all": 0,
        "7+": 7,
        "13+": 13,
        "16+": 16,
        "18+": 18,
    }

    def get_profile(self, request):

        profile_id = request.query_params.get(
            "profile_id"
        )

        if not profile_id:
            return None

        if not request.user.is_authenticated:
            return None

        try:

            return Profile.objects.get(
                id=profile_id,
                user=request.user,
                is_active=True,
            )

        except Profile.DoesNotExist:

            return None

    def filter_by_maturity(
        self,
        queryset,
        profile
    ):

        if profile is None:
            return queryset

        if profile.is_kids:

            max_age = 7

        else:

            max_age = self.MATURITY_LEVELS.get(
                profile.maturity_level,
                18
            )

        allowed_ratings = []

        for rating, age in self.MATURITY_LEVELS.items():

            if age <= max_age:

                allowed_ratings.append(
                    rating
                )

        return queryset.filter(
            maturity_rating__in=allowed_ratings
        )

    def get_movie_queryset(
        self,
        profile=None
    ):

        queryset = Movie.objects.filter(
            is_published=True
        ).prefetch_related(
            "genres",
            "cast",
            "directors",
        )

        return self.filter_by_maturity(
            queryset,
            profile
        )

    def get_show_queryset(
        self,
        profile=None
    ):

        queryset = TVShow.objects.filter(
            is_published=True
        ).prefetch_related(
            "genres",
            "cast",
            "directors",
            "seasons__episodes",
        )

        return self.filter_by_maturity(
            queryset,
            profile
        )


class SearchView(
    DiscoveryBaseView
):

    def get(self, request):

        query = request.query_params.get(
            "q",
            ""
        ).strip()


        # =====================================================
        # PROFILE
        # =====================================================

        # An empty query is allowed when filters are supplied.
        # The frontend uses this for filter-only discovery.
        profile = self.get_profile(
            request
        )


        # =====================================================
        # FILTER VALUES
        # =====================================================

        content_type = (
            request.query_params.get(
                "type",
                "all"
            ).lower()
        )


        genre = (
            request.query_params.get(
                "genre",
                ""
            ).strip()
        )


        year = (
            request.query_params.get(
                "year",
                ""
            ).strip()
        )


        sort = (
            request.query_params.get(
                "sort",
                "relevance"
            ).lower()
        )


        # =====================================================
        # BASE QUERYSETS
        # =====================================================

        movies = self.get_movie_queryset(
            profile
        )


        shows = self.get_show_queryset(
            profile
        )


        # =====================================================
        # TEXT SEARCH
        # =====================================================

        # Text search is optional.
        # If query is empty, keep the base querysets so that
        # genre/year/type/sort filters can still return results.
        search_filter = None

        if query:

            search_filter = (
                Q(title__icontains=query)
                |
                Q(description__icontains=query)
                |
                Q(genres__name__icontains=query)
                |
                Q(cast__name__icontains=query)
                |
                Q(directors__name__icontains=query)
            )


        # =====================================================
        # MOVIE SEARCH
        # =====================================================

        if content_type in [
            "all",
            "movie",
            "movies",
        ]:

            if search_filter is not None:

                movies = (
                    movies
                    .filter(search_filter)
                    .distinct()
                )

        else:

            movies = Movie.objects.none()


        # =====================================================
        # SHOW SEARCH
        # =====================================================

        if content_type in [
            "all",
            "show",
            "shows",
            "tv",
            "tvshow",
            "tvshows",
        ]:

            if search_filter is not None:

                shows = (
                    shows
                    .filter(search_filter)
                    .distinct()
                )

        else:

            shows = TVShow.objects.none()


        # =====================================================
        # GENRE FILTER
        # =====================================================

        if genre:

            if genre.isdigit():

                movies = movies.filter(
                    genres__id=int(genre)
                )

                shows = shows.filter(
                    genres__id=int(genre)
                )

            else:

                movies = movies.filter(
                    genres__slug=genre
                )

                shows = shows.filter(
                    genres__slug=genre
                )


        # =====================================================
        # YEAR FILTER
        # =====================================================

        if year.isdigit():

            movies = movies.filter(
                release_year=int(year)
            )

            shows = shows.filter(
                release_year=int(year)
            )


        # =====================================================
        # SORTING
        # =====================================================

        if sort == "popular":

            movies = movies.order_by(
                "-view_count",
                "-created_at"
            )

            shows = shows.order_by(
                "-view_count",
                "-created_at"
            )


        elif sort == "newest":

            movies = movies.order_by(
                "-release_year",
                "-created_at"
            )

            shows = shows.order_by(
                "-release_year",
                "-created_at"
            )


        elif sort == "oldest":

            movies = movies.order_by(
                "release_year",
                "created_at"
            )

            shows = shows.order_by(
                "release_year",
                "created_at"
            )


        else:

            # Relevance fallback:
            # title matches remain naturally prominent
            movies = movies.order_by(
                "title"
            )

            shows = shows.order_by(
                "title"
            )


        # =====================================================
        # LIMIT RESULTS
        # =====================================================

        movies = movies[:50]

        shows = shows[:50]


        # =====================================================
        # SERIALIZE
        # =====================================================

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


        # =====================================================
        # RESPONSE
        # =====================================================

        return Response({

            "query": query,

            "filters": {
                "type": content_type,
                "genre": genre,
                "year": year,
                "sort": sort,
            },

            "movies": movie_data,

            "shows": show_data,

            "total": (
                len(movie_data)
                +
                len(show_data)
            ),

        })


class HomeView(
    DiscoveryBaseView
):

    def get_hero(
        self,
        movies,
        shows,
        request
    ):

        featured_movies = movies.filter(
            is_featured=True
        ).order_by(
            "-view_count",
            "-created_at"
        )

        featured_shows = shows.filter(
            is_featured=True
        ).order_by(
            "-view_count",
            "-created_at"
        )

        movie = featured_movies.first()

        if movie:

            data = MovieSerializer(
                movie,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "movie"

            return data

        show = featured_shows.first()

        if show:

            data = TVShowSerializer(
                show,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "show"

            return data

        return None

    def get_trending(
        self,
        movies,
        shows,
        request
    ):

        movie_items = list(
            movies.order_by(
                "-view_count",
                "-created_at"
            )[:10]
        )

        show_items = list(
            shows.order_by(
                "-view_count",
                "-created_at"
            )[:10]
        )

        results = []

        for movie in movie_items:

            data = MovieSerializer(
                movie,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "movie"

            results.append(data)

        for show in show_items:

            data = TVShowSerializer(
                show,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "show"

            results.append(data)

        results.sort(
            key=lambda item: item.get(
                "view_count",
                0
            ),
            reverse=True
        )

        return results[:20]

    def get_popular(
        self,
        movies,
        shows,
        request
    ):

        movie_items = list(
            movies.order_by(
                "-view_count"
            )[:10]
        )

        show_items = list(
            shows.order_by(
                "-view_count"
            )[:10]
        )

        results = []

        for movie in movie_items:

            data = MovieSerializer(
                movie,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "movie"

            results.append(data)

        for show in show_items:

            data = TVShowSerializer(
                show,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "show"

            results.append(data)

        results.sort(
            key=lambda item: item.get(
                "view_count",
                0
            ),
            reverse=True
        )

        return results[:20]

    def get_new_releases(
        self,
        movies,
        shows,
        request
    ):

        movie_items = list(
            movies.order_by(
                "-release_year",
                "-created_at"
            )[:10]
        )

        show_items = list(
            shows.order_by(
                "-release_year",
                "-created_at"
            )[:10]
        )

        results = []

        for movie in movie_items:

            data = MovieSerializer(
                movie,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "movie"

            results.append(data)

        for show in show_items:

            data = TVShowSerializer(
                show,
                context={
                    "request": request
                }
            ).data

            data["content_type"] = "show"

            results.append(data)

        results.sort(
            key=lambda item: item.get(
                "release_year",
                0
            ),
            reverse=True
        )

        return results[:20]

    def get_genre_sections(
        self,
        movies,
        shows,
        request
    ):

        genres = Genre.objects.all().order_by(
            "name"
        )

        sections = []

        for genre in genres:

            genre_movies = movies.filter(
                genres=genre
            ).order_by(
                "-view_count",
                "-created_at"
            )[:10]

            genre_shows = shows.filter(
                genres=genre
            ).order_by(
                "-view_count",
                "-created_at"
            )[:10]

            items = []

            for movie in genre_movies:

                data = MovieSerializer(
                    movie,
                    context={
                        "request": request
                    }
                ).data

                data["content_type"] = "movie"

                items.append(data)

            for show in genre_shows:

                data = TVShowSerializer(
                    show,
                    context={
                        "request": request
                    }
                ).data

                data["content_type"] = "show"

                items.append(data)

            items.sort(
                key=lambda item: item.get(
                    "view_count",
                    0
                ),
                reverse=True
            )

            if items:

                sections.append({
                    "id": genre.id,
                    "name": genre.name,
                    "slug": genre.slug,
                    "items": items[:20],
                })

        return sections

    def get_my_list(
        self,
        profile,
        request
    ):

        if not profile:
            return []

        items = MyList.objects.filter(
            profile=profile
        ).select_related(
            "content_type"
        ).order_by(
            "-created_at"
        )[:20]

        results = []

        for item in items:

            content = item.content

            if not content:
                continue

            if isinstance(
                content,
                Movie
            ):

                data = MovieSerializer(
                    content,
                    context={
                        "request": request
                    }
                ).data

                data["content_type"] = "movie"

            elif isinstance(
                content,
                TVShow
            ):

                data = TVShowSerializer(
                    content,
                    context={
                        "request": request
                    }
                ).data

                data["content_type"] = "show"

            else:

                continue

            results.append(data)

        return results

    def get_continue_watching(
        self,
        profile,
        request
    ):

        if not profile:
            return []

        progress_items = WatchProgress.objects.filter(
            profile=profile,
            completed=False,
            position__gt=0,
        ).select_related(
            "content_type"
        ).order_by(
            "-updated_at"
        )[:20]

        results = []

        for progress in progress_items:

            content = progress.content

            if not content:
                continue

            if isinstance(
                content,
                Movie
            ):

                data = MovieSerializer(
                    content,
                    context={
                        "request": request
                    }
                ).data

                data["content_type"] = "movie"

            elif isinstance(
                content,
                Episode
            ):

                data = {
                    "id": content.id,
                    "content_type": "episode",
                    "title": content.title,
                    "description": content.description,
                    "thumbnail": (
                        request.build_absolute_uri(
                            content.thumbnail.url
                        )
                        if content.thumbnail
                        else None
                    ),
                    "duration": content.duration,
                    "video_url": content.video_url,
                    "season_id": content.season_id,
                    "season_number": (
                        content.season.season_number
                    ),
                    "show_id": (
                        content.season.show_id
                    ),
                    "show_title": (
                        content.season.show.title
                    ),
                }

            else:

                continue

            data["watch_progress"] = {

                "position": progress.position,

                "duration": progress.duration,

                "completed": progress.completed,

                "progress_percentage": (
                    round(
                        (
                            progress.position
                            /
                            progress.duration
                        ) * 100,
                        2
                    )
                    if progress.duration
                    else 0
                ),
            }

            results.append(data)

        return results

    def get(self, request):

        profile = self.get_profile(
            request
        )

        movies = self.get_movie_queryset(
            profile
        )

        shows = self.get_show_queryset(
            profile
        )

        return Response({

            "profile": (
                {
                    "id": profile.id,
                    "name": profile.name,
                    "is_kids": profile.is_kids,
                    "language": profile.language,
                }
                if profile
                else None
            ),

            "hero": self.get_hero(
                movies,
                shows,
                request
            ),

            "continue_watching": (
                self.get_continue_watching(
                    profile,
                    request
                )
            ),

            "my_list": self.get_my_list(
                profile,
                request
            ),

            "trending": self.get_trending(
                movies,
                shows,
                request
            ),

            "popular": self.get_popular(
                movies,
                shows,
                request
            ),

            "new_releases": (
                self.get_new_releases(
                    movies,
                    shows,
                    request
                )
            ),

            "genres": (
                self.get_genre_sections(
                    movies,
                    shows,
                    request
                )
            ),
        })