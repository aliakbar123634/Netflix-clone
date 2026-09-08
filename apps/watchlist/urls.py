from django.urls import path

from .views import (
    MyListView,
    MyListDeleteView,
)


urlpatterns = [

    path(
        "",
        MyListView.as_view(),
        name="my-list",
    ),

    path(
        "<int:pk>/",
        MyListDeleteView.as_view(),
        name="my-list-delete",
    ),
]