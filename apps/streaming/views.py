from django.db import transaction
from django.db.models import F
from django.utils import timezone
from django.contrib.contenttypes.models import ContentType

from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.catalog.models import (
    Movie,
    Episode,
)

from apps.profiles.models import (
    Profile,
)

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


# ============================================================
# STREAMING BASE VIEW
# ============================================================

class StreamingBaseView(
    APIView
):

    permission_classes = [
        IsAuthenticated
    ]


    # ========================================================
    # GET PROFILE
    # ========================================================

    def get_profile(
        self,
        request
    ):

        profile_id = (
            request.query_params.get(
                "profile_id"
            )
        )

        if not profile_id:

            return None

        try:

            profile = (
                Profile.objects.get(
                    id=profile_id,
                    user=request.user,
                    is_active=True,
                )
            )

            return profile

        except Profile.DoesNotExist:

            return None


    # ========================================================
    # ACTIVE SUBSCRIPTION
    # ========================================================

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


    # ========================================================
    # MATURITY FILTER
    # ========================================================

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

            max_age = (
                maturity_levels.get(
                    profile.maturity_level,
                    18
                )
            )

        content_age = (
            maturity_levels.get(
                content.maturity_rating,
                18
            )
        )

        return (
            content_age <= max_age
        )


    # ========================================================
    # GET WATCH PROGRESS
    # ========================================================
    

    # ========================================================
# GET WATCH PROGRESS
# ========================================================

    def get_progress(
    self,
    profile,
    content
):

    # ----------------------------------------------------
    # GET DJANGO CONTENT TYPE
    # ----------------------------------------------------

        content_type = ContentType.objects.get_for_model(
            content
    )

    # ----------------------------------------------------
    # FIND EXISTING PROGRESS
    # ----------------------------------------------------

        progress = (
        WatchProgress.objects
        .filter(
            profile=profile,
            content_type=content_type,
            object_id=content.id,
        )
        .first()
    )

    # ----------------------------------------------------
    # NO PREVIOUS PROGRESS
    # ----------------------------------------------------

        if not progress:

            duration_seconds = int(
            (content.duration or 0) * 60
        )

            return {
            "position": 0,

            "duration": duration_seconds,

            "completed": False,

            "progress_percentage": 0,
        }

    # ----------------------------------------------------
    # EXISTING PROGRESS
    # ----------------------------------------------------

        duration = int(
        progress.duration or 0
    )

        position = int(
        progress.position or 0
    )

    # ----------------------------------------------------
    # CALCULATE PERCENTAGE
    # ----------------------------------------------------

        if duration > 0:

            percentage = (
            position /
            duration
        ) * 100

        else:

            percentage = 0

    # ----------------------------------------------------
    # RETURN PROGRESS
    # ----------------------------------------------------

        return {

        "position": position,

        "duration": duration,

        "completed": progress.completed,

        "progress_percentage": round(
            min(
                percentage,
                100
            ),
            2
        ),

    }


    # def get_progress(
    #     self,
    #     profile,
    #     content
    # ):

    #     progress = (
    #         WatchProgress.objects
    #         .filter(
    #             profile=profile,
    #             content=content,
    #         )
    #         .first()
    #     )

    #     # ----------------------------------------------------
    #     # No previous progress
    #     # ----------------------------------------------------

    #     if not progress:

    #         duration_seconds = int(
    #             (content.duration or 0) * 60
    #         )

    #         return {

    #             "position": 0,

    #             "duration": (
    #                 duration_seconds
    #             ),

    #             "completed": False,

    #             "progress_percentage": 0,

    #         }


    #     # ----------------------------------------------------
    #     # Existing progress
    #     # ----------------------------------------------------

    #     duration = int(
    #         progress.duration or 0
    #     )

    #     position = int(
    #         progress.position or 0
    #     )

    #     if duration > 0:

    #         percentage = (
    #             position /
    #             duration
    #         ) * 100

    #     else:

    #         percentage = 0


    #     return {

    #         "position": position,

    #         "duration": duration,

    #         "completed": (
    #             progress.completed
    #         ),

    #         "progress_percentage": round(
    #             min(
    #                 percentage,
    #                 100
    #             ),
    #             2
    #         ),

    #     }


    # ========================================================
    # NEXT EPISODE
    # ========================================================

    def get_next_episode(
        self,
        episode
    ):

        current_season = (
            episode.season
        )

        current_show = (
            current_season.show
        )


        # ----------------------------------------------------
        # Next episode in SAME season
        # ----------------------------------------------------

        next_episode = (
            Episode.objects
            .filter(
                season=current_season,
                episode_number__gt=(
                    episode.episode_number
                ),
                is_published=True,
            )
            .order_by(
                "episode_number"
            )
            .first()
        )


        if next_episode:

            return {

                "id": next_episode.id,

                "title": next_episode.title,

                "episode_number": (
                    next_episode.episode_number
                ),

                "season_id": (
                    current_season.id
                ),

                "season_number": (
                    current_season.season_number
                ),

            }


        # ----------------------------------------------------
        # First episode of NEXT season
        # ----------------------------------------------------

        next_season = (
            current_show.seasons
            .filter(
                season_number__gt=(
                    current_season.season_number
                )
            )
            .order_by(
                "season_number"
            )
            .first()
        )


        if not next_season:

            return None


        next_episode = (
            next_season.episodes
            .filter(
                is_published=True
            )
            .order_by(
                "episode_number"
            )
            .first()
        )


        if not next_episode:

            return None


        return {

            "id": next_episode.id,

            "title": next_episode.title,

            "episode_number": (
                next_episode.episode_number
            ),

            "season_id": (
                next_season.id
            ),

            "season_number": (
                next_season.season_number
            ),

        }


# ============================================================
# MOVIE STREAMING
# ============================================================

class MovieStreamView(
    StreamingBaseView
):


    def get(
        self,
        request,
        movie_id
    ):

        # ====================================================
        # PROFILE
        # ====================================================

        profile = self.get_profile(
            request
        )

        if not profile:

            return Response(

                {
                    "detail": (
                        "Valid profile_id "
                        "is required."
                    )
                },

                status=400
            )


        # ====================================================
        # SUBSCRIPTION
        # ====================================================

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
                        "is required to watch "
                        "content."
                    ),

                    "subscription_required": True,

                },

                status=403
            )


        # ====================================================
        # MOVIE
        # ====================================================

        try:

            movie = (
                Movie.objects
                .prefetch_related(
                    "genres",
                    "cast",
                    "directors",
                )
                .get(
                    id=movie_id,
                    is_published=True,
                )
            )

        except Movie.DoesNotExist:

            return Response(

                {
                    "detail":
                        "Movie not found."
                },

                status=404
            )


        # ====================================================
        # MATURITY
        # ====================================================

        if not self.is_content_allowed(
            movie,
            profile
        ):

            return Response(

                {
                    "detail": (
                        "This content is not "
                        "available for this "
                        "profile."
                    )
                },

                status=403
            )


        # ====================================================
        # VIDEO URL
        # ====================================================

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


        # ====================================================
        # WATCH PROGRESS
        # ====================================================

        progress = self.get_progress(
            profile,
            movie
        )


        # ====================================================
        # VIEW COUNT
        # ====================================================

        with transaction.atomic():

            Movie.objects.filter(
                id=movie.id
            ).update(

                view_count=(
                    F("view_count") + 1
                )

            )


        # ====================================================
        # SERIALIZER
        # ====================================================

        serializer = (
            MoviePlaybackSerializer(
                movie,
                context={
                    "request": request
                }
            )
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        return Response(

            {

                "content_type": "movie",

                "content": (
                    serializer.data
                ),

                "playback": {

                    "video_url": (
                        movie.video_url
                    ),

                    "quality": (
                        subscription
                        .plan
                        .video_quality
                    ),

                },

                "subscription": {

                    "plan": (
                        subscription
                        .plan
                        .name
                    ),

                    "video_quality": (
                        subscription
                        .plan
                        .video_quality
                    ),

                    "max_devices": (
                        subscription
                        .plan
                        .max_devices
                    ),

                    "expires_at": (
                        subscription
                        .end_date
                    ),

                },

                "watch_progress": progress,

            }
        )


# ============================================================
# EPISODE STREAMING
# ============================================================

class EpisodeStreamView(
    StreamingBaseView
):


    def get(
        self,
        request,
        episode_id
    ):

        # ====================================================
        # PROFILE
        # ====================================================

        profile = self.get_profile(
            request
        )

        if not profile:

            return Response(

                {
                    "detail": (
                        "Valid profile_id "
                        "is required."
                    )
                },

                status=400
            )


        # ====================================================
        # SUBSCRIPTION
        # ====================================================

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
                        "is required to watch "
                        "content."
                    ),

                    "subscription_required": True,

                },

                status=403
            )


        # ====================================================
        # EPISODE
        # ====================================================

        try:

            episode = (
                Episode.objects
                .select_related(
                    "season",
                    "season__show",
                )
                .get(
                    id=episode_id
                )
            )

        except Episode.DoesNotExist:

            return Response(

                {
                    "detail":
                        "Episode not found."
                },

                status=404
            )


        # ====================================================
        # PUBLISHED
        # ====================================================

        if not episode.is_published:

            return Response(

                {
                    "detail": (
                        "This episode is "
                        "not available."
                    )
                },

                status=404
            )


        # ====================================================
        # SHOW
        # ====================================================

        show = (
            episode.season.show
        )


        # ====================================================
        # MATURITY
        # ====================================================

        if not self.is_content_allowed(
            show,
            profile
        ):

            return Response(

                {
                    "detail": (
                        "This content is not "
                        "available for this "
                        "profile."
                    )
                },

                status=403
            )


        # ====================================================
        # VIDEO URL
        # ====================================================

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


        # ====================================================
        # WATCH PROGRESS
        # ====================================================

        progress = self.get_progress(
            profile,
            episode
        )


        # ====================================================
        # NEXT EPISODE
        # ====================================================

        next_episode = (
            self.get_next_episode(
                episode
            )
        )


        # ====================================================
        # VIEW COUNT
        # ====================================================

        with transaction.atomic():

            Episode.objects.filter(
                id=episode.id
            ).update(

                view_count=(
                    F("view_count") + 1
                )

            )


        # ====================================================
        # SERIALIZER
        # ====================================================

        serializer = (
            EpisodePlaybackSerializer(
                episode,
                context={
                    "request": request
                }
            )
        )


        # ====================================================
        # RESPONSE
        # ====================================================

        return Response(

            {

                "content_type": "episode",

                "content": (
                    serializer.data
                ),

                "show": {

                    "id": show.id,

                    "title": show.title,

                },

                "season": {

                    "id": (
                        episode
                        .season
                        .id
                    ),

                    "season_number": (
                        episode
                        .season
                        .season_number
                    ),

                },

                "playback": {

                    "video_url": (
                        episode.video_url
                    ),

                    "quality": (
                        subscription
                        .plan
                        .video_quality
                    ),

                },

                "subscription": {

                    "plan": (
                        subscription
                        .plan
                        .name
                    ),

                    "video_quality": (
                        subscription
                        .plan
                        .video_quality
                    ),

                    "max_devices": (
                        subscription
                        .plan
                        .max_devices
                    ),

                    "expires_at": (
                        subscription
                        .end_date
                    ),

                },

                "watch_progress": progress,

                "next_episode": (
                    next_episode
                ),

            }
        )