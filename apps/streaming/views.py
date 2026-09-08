from django.db import transaction
from django.db.models import F
from django.utils import timezone

from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import (
    Movie,
    Episode,
)

from apps.profiles.models import Profile

from apps.subscriptions.models import (
    Subscription,
)

from apps.history.models import (
    WatchProgress,
)

from apps.streaming.serializers import (
    MoviePlaybackSerializer,
    EpisodePlaybackSerializer,
)


class StreamingBaseView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    # ============================================================
    # GET PROFILE
    # ============================================================

    def get_profile(
        self,
        request
    ):

        profile_id = request.query_params.get(
            "profile_id"
        )

        if not profile_id:

            return None

        try:

            profile = Profile.objects.get(
                id=profile_id,
                user=request.user,
                is_active=True,
            )

            return profile

        except Profile.DoesNotExist:

            return None

    # ============================================================
    # CHECK SUBSCRIPTION
    # ============================================================

    def get_active_subscription(
        self,
        user
    ):

        subscription = (
            Subscription.objects
            .filter(
                user=user,
                status="active",
                start_date__lte=timezone.now(),
                end_date__gte=timezone.now(),
            )
            .select_related(
                "plan"
            )
            .order_by(
                "-end_date"
            )
            .first()
        )

        return subscription

    # ============================================================
    # MATURITY FILTER
    # ============================================================

    def is_content_allowed(
        self,
        content,
        profile
    ):

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
                18
            )

        content_age = maturity_levels.get(
            content.maturity_rating,
            18
        )

        return content_age <= max_age

    # ============================================================
    # GET WATCH PROGRESS
    # ============================================================

    def get_progress(
        self,
        profile,
        content
    ):

        progress = (
            WatchProgress.objects
            .filter(
                profile=profile,
                content=content
            )
            .first()
        )

        if not progress:

            return {

                "position": 0,

                "duration": (
                    content.duration
                    or 0
                ),

                "completed": False,

                "progress_percentage": 0,
            }

        duration = progress.duration

        if duration > 0:

            percentage = (
                progress.position
                /
                duration
            ) * 100

        else:

            percentage = 0

        return {

            "position": progress.position,

            "duration": duration,

            "completed": progress.completed,

            "progress_percentage": round(
                percentage,
                2
            ),
        }


# ================================================================
# MOVIE STREAMING
# ================================================================

class MovieStreamView(
    StreamingBaseView
):

    def get(
        self,
        request,
        movie_id
    ):

        # --------------------------------------------------------
        # Profile
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
        # Subscription
        # --------------------------------------------------------

        subscription = (
            self.get_active_subscription(
                request.user
            )
        )

        if not subscription:

            return Response(
                {
                    "detail": (
                        "An active subscription "
                        "is required to watch content."
                    ),

                    "subscription_required": True,
                },
                status=403
            )

        # --------------------------------------------------------
        # Movie
        # --------------------------------------------------------

        try:

            movie = Movie.objects.get(
                id=movie_id,
                is_published=True
            )

        except Movie.DoesNotExist:

            return Response(
                {
                    "detail": "Movie not found."
                },
                status=404
            )

        # --------------------------------------------------------
        # Maturity
        # --------------------------------------------------------

        if not self.is_content_allowed(
            movie,
            profile
        ):

            return Response(
                {
                    "detail": (
                        "This content is not "
                        "available for this profile."
                    )
                },
                status=403
            )

        # --------------------------------------------------------
        # Video URL
        # --------------------------------------------------------

        if not movie.video_url:

            return Response(
                {
                    "detail": (
                        "Video is not available "
                        "for this movie."
                    )
                },
                status=404
            )

        # --------------------------------------------------------
        # Progress
        # --------------------------------------------------------

        progress = self.get_progress(
            profile,
            movie
        )

        # --------------------------------------------------------
        # Increment view count
        # --------------------------------------------------------

        with transaction.atomic():

            Movie.objects.filter(
                id=movie.id
            ).update(
                view_count=F("view_count") + 1
            )

        # --------------------------------------------------------
        # Serialize
        # --------------------------------------------------------

        serializer = MoviePlaybackSerializer(
            movie
        )

        # --------------------------------------------------------
        # Response
        # --------------------------------------------------------

        return Response({

            "content_type": "movie",

            "content": serializer.data,

            "playback": {

                "video_url": movie.video_url,

                "quality": (
                    subscription.plan.video_quality
                ),

            },

            "subscription": {

                "plan": subscription.plan.name,

                "video_quality": (
                    subscription.plan.video_quality
                ),

                "max_devices": (
                    subscription.plan.max_devices
                ),

                "expires_at": (
                    subscription.end_date
                ),
            },

            "watch_progress": progress,

        })


# ================================================================
# EPISODE STREAMING
# ================================================================

class EpisodeStreamView(
    StreamingBaseView
):

    def get(
        self,
        request,
        episode_id
    ):

        # --------------------------------------------------------
        # Profile
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
        # Subscription
        # --------------------------------------------------------

        subscription = (
            self.get_active_subscription(
                request.user
            )
        )

        if not subscription:

            return Response(
                {
                    "detail": (
                        "An active subscription "
                        "is required to watch content."
                    ),

                    "subscription_required": True,
                },
                status=403
            )

        # --------------------------------------------------------
        # Episode
        # --------------------------------------------------------

        try:

            episode = (
                Episode.objects
                .select_related(
                    "season",
                    "season__show"
                )
                .get(
                    id=episode_id
                )
            )

        except Episode.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "Episode not found."
                    )
                },
                status=404
            )

        # --------------------------------------------------------
        # Published check
        # --------------------------------------------------------

        if not episode.is_published:

            return Response(
                {
                    "detail": (
                        "This episode is not available."
                    )
                },
                status=404
            )

        # --------------------------------------------------------
        # Maturity
        # --------------------------------------------------------

        show = episode.season.show

        if not self.is_content_allowed(
            show,
            profile
        ):

            return Response(
                {
                    "detail": (
                        "This content is not "
                        "available for this profile."
                    )
                },
                status=403
            )

        # --------------------------------------------------------
        # Video URL
        # --------------------------------------------------------

        if not episode.video_url:

            return Response(
                {
                    "detail": (
                        "Video is not available "
                        "for this episode."
                    )
                },
                status=404
            )

        # --------------------------------------------------------
        # Progress
        # --------------------------------------------------------

        progress = self.get_progress(
            profile,
            episode
        )

        # --------------------------------------------------------
        # Serialize
        # --------------------------------------------------------

        serializer = EpisodePlaybackSerializer(
            episode
        )

        # --------------------------------------------------------
        # Response
        # --------------------------------------------------------

        return Response({

            "content_type": "episode",

            "content": serializer.data,

            "show": {

                "id": show.id,

                "title": show.title,

            },

            "season": {

                "id": episode.season.id,

                "season_number": (
                    episode.season.season_number
                ),

            },

            "playback": {

                "video_url": (
                    episode.video_url
                ),

                "quality": (
                    subscription.plan.video_quality
                ),

            },

            "subscription": {

                "plan": subscription.plan.name,

                "video_quality": (
                    subscription.plan.video_quality
                ),

                "max_devices": (
                    subscription.plan.max_devices
                ),

                "expires_at": (
                    subscription.end_date
                ),
            },

            "watch_progress": progress,

        })