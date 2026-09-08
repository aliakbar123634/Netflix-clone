from django.urls import path

from .views import (
    WatchProgressListCreateView,
    WatchProgressDetailView,
    ContinueWatchingView,
    WatchHistoryView,
    WatchHistoryDeleteView,
)


urlpatterns = [

    path(
        "watch-progress/",
        WatchProgressListCreateView.as_view(),
        name="watch-progress",
    ),

    path(
        "watch-progress/<int:pk>/",
        WatchProgressDetailView.as_view(),
        name="watch-progress-detail",
    ),

    path(
        "continue-watching/",
        ContinueWatchingView.as_view(),
        name="continue-watching",
    ),

    path(
        "",
        WatchHistoryView.as_view(),
        name="watch-history",
    ),

    path(
        "<int:pk>/",
        WatchHistoryDeleteView.as_view(),
        name="watch-history-delete",
    ),
]