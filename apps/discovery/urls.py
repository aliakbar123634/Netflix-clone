from django.urls import path

from .views import (
    SearchView,
    HomeView,
)


urlpatterns = [

    path(
        "search/",
        SearchView.as_view(),
        name="search",
    ),

    path(
        "home/",
        HomeView.as_view(),
        name="home",
    ),
]