from django.urls import path

from .views import (
    ProfileListCreateView,
    ProfileDetailView,
    VerifyProfilePINView,
)


urlpatterns = [

    path(
        "",
        ProfileListCreateView.as_view(),
        name="profile-list-create",
    ),

    path(
        "<int:pk>/",
        ProfileDetailView.as_view(),
        name="profile-detail",
    ),
    path(
        "<int:pk>/verify-pin/",
        VerifyProfilePINView.as_view(),
        name="verify-profile-pin",
    ),
]