from django.urls import path

from apps.streaming.views import (
    MovieStreamView,
    EpisodeStreamView,
)


urlpatterns = [

    path(
        "movies/<int:movie_id>/",
        MovieStreamView.as_view(),
        name="movie-stream"
    ),

    path(
        "episodes/<int:episode_id>/",
        EpisodeStreamView.as_view(),
        name="episode-stream"
    ),
]