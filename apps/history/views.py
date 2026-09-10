from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import (
    WatchProgress,
    WatchHistory,
)

from .serializers import (
    WatchProgressSerializer,
    WatchHistorySerializer,
)


class WatchProgressListCreateView(
    generics.ListCreateAPIView
):

    serializer_class = WatchProgressSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        profile_id = (
            self.request.query_params.get(
                "profile_id"
            )
        )

        if not profile_id:

            return WatchProgress.objects.none()

        return (
            WatchProgress.objects
            .filter(
                profile__user=self.request.user,
                profile_id=profile_id,
            )
            .select_related(
                "content_type",
            )
        )

    def get_serializer_context(self):

        context = (
            super().get_serializer_context()
        )

        if self.request.method == "GET":

            profile_id = (
                self.request.query_params.get(
                    "profile_id"
                )
            )

        else:

            profile_id = (
                self.request.data.get(
                    "profile_id"
                )
            )

        if not profile_id:

            from rest_framework.exceptions import (
                ValidationError
            )

            raise ValidationError({
                "profile_id":
                    "Profile ID is required."
            })

        try:

            profile = (
                self.request.user.profiles.get(
                    id=profile_id,
                    is_active=True,
                )
            )

        except Exception:

            from rest_framework.exceptions import (
                ValidationError
            )

            raise ValidationError({
                "profile_id":
                    "Invalid profile."
            })

        context["profile"] = profile

        return context


class WatchProgressDetailView(
    generics.RetrieveAPIView
):

    serializer_class = WatchProgressSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            WatchProgress.objects
            .filter(
                profile__user=self.request.user
            )
        )


class ContinueWatchingView(
    generics.ListAPIView
):

    serializer_class = WatchProgressSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        profile_id = (
            self.request.query_params.get(
                "profile_id"
            )
        )

        if not profile_id:

            return WatchProgress.objects.none()

        return (
            WatchProgress.objects
            .filter(
                profile__user=self.request.user,
                profile_id=profile_id,
                completed=False,
                position__gt=0,
            )
            .select_related(
                "content_type",
            )
            .order_by(
                "-updated_at"
            )
        )


class WatchHistoryView(
    generics.ListAPIView
):

    serializer_class = WatchHistorySerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        profile_id = (
            self.request.query_params.get(
                "profile_id"
            )
        )

        if not profile_id:

            return WatchHistory.objects.none()

        return (
            WatchHistory.objects
            .filter(
                profile__user=self.request.user,
                profile_id=profile_id,
            )
            .select_related(
                "content_type",
            )
            .order_by(
                "-watched_at"
            )
        )


class WatchHistoryDeleteView(
    generics.DestroyAPIView
):

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return (
            WatchHistory.objects
            .filter(
                profile__user=self.request.user
            )
        )