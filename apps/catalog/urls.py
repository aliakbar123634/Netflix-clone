from django.urls import path, include

from rest_framework.routers import DefaultRouter

from .views import (
    GenreViewSet,
    PersonViewSet,
    MovieViewSet,
    TVShowViewSet,
    SeasonViewSet,
    EpisodeViewSet,
)


router = DefaultRouter()

router.register(
    "genres",
    GenreViewSet,
    basename="genre"
)

router.register(
    "people",
    PersonViewSet,
    basename="person"
)

router.register(
    "movies",
    MovieViewSet,
    basename="movie"
)

router.register(
    "shows",
    TVShowViewSet,
    basename="show"
)

router.register(
    "seasons",
    SeasonViewSet,
    basename="season"
)

router.register(
    "episodes",
    EpisodeViewSet,
    basename="episode"
)


urlpatterns = [
    path(
        "",
        include(router.urls)
    ),
]