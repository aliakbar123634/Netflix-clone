from datetime import timedelta

from django.utils import timezone

from rest_framework.permissions import (
    IsAuthenticated,
)
from rest_framework.response import Response
from rest_framework.views import APIView

from apps.subscriptions.models import (
    Plan,
    Subscription,
)

from apps.subscriptions.serializers import (
    PlanSerializer,
    SubscriptionSerializer,
)


# ============================================================
# PLAN LIST
# ============================================================

class PlanListView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        plans = Plan.objects.filter(
            is_active=True
        ).order_by(
            "price"
        )

        serializer = PlanSerializer(
            plans,
            many=True
        )

        return Response({

            "count": plans.count(),

            "plans": serializer.data,

        })


# ============================================================
# CURRENT SUBSCRIPTION
# ============================================================

class CurrentSubscriptionView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        subscription = (
            Subscription.objects
            .filter(
                user=request.user
            )
            .select_related(
                "plan"
            )
            .order_by(
                "-created_at"
            )
            .first()
        )

        if not subscription:

            return Response({

                "has_subscription": False,

                "subscription": None,

            })

        # ----------------------------------------------------
        # Automatically expire old subscription
        # ----------------------------------------------------

        if (
            subscription.status == "active"
            and
            subscription.end_date <= timezone.now()
        ):

            subscription.status = "expired"

            subscription.save(
                update_fields=[
                    "status",
                    "updated_at",
                ]
            )

        serializer = SubscriptionSerializer(
            subscription
        )

        return Response({

            "has_subscription": (
                subscription.status == "active"
            ),

            "subscription": serializer.data,

        })


# ============================================================
# SUBSCRIPTION HISTORY
# ============================================================

class SubscriptionHistoryView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get(self, request):

        subscriptions = (
            Subscription.objects
            .filter(
                user=request.user
            )
            .select_related(
                "plan"
            )
            .order_by(
                "-created_at"
            )
        )

        serializer = SubscriptionSerializer(
            subscriptions,
            many=True
        )

        return Response({

            "count": subscriptions.count(),

            "subscriptions": serializer.data,

        })


# ============================================================
# DEMO SUBSCRIPTION
# ============================================================
#
# This is NOT a real payment endpoint.
#
# It is only for assignment/demo purposes.
#
# Later:
#
# Stripe
# PayPal
# JazzCash
# Easypaisa
#
# can create the subscription after
# successful payment.
# ============================================================

class ActivateSubscriptionView(APIView):

    permission_classes = [
        IsAuthenticated
    ]

    def post(self, request):

        plan_id = request.data.get(
            "plan_id"
        )

        if not plan_id:

            return Response(
                {
                    "detail": (
                        "plan_id is required."
                    )
                },
                status=400
            )

        try:

            plan = Plan.objects.get(
                id=plan_id,
                is_active=True
            )

        except Plan.DoesNotExist:

            return Response(
                {
                    "detail": (
                        "Active plan not found."
                    )
                },
                status=404
            )

        now = timezone.now()

        # ----------------------------------------------------
        # Demo subscription = 30 days
        # ----------------------------------------------------

        end_date = now + timedelta(
            days=30
        )

        # ----------------------------------------------------
        # Expire existing active subscriptions
        # ----------------------------------------------------

        Subscription.objects.filter(
            user=request.user,
            status="active"
        ).update(
            status="expired",
            updated_at=now
        )

        # ----------------------------------------------------
        # Create new subscription
        # ----------------------------------------------------

        subscription = Subscription.objects.create(

            user=request.user,

            plan=plan,

            start_date=now,

            end_date=end_date,

            status="active",
        )

        serializer = SubscriptionSerializer(
            subscription
        )

        return Response({

            "message": (
                "Subscription activated successfully."
            ),

            "subscription": serializer.data,

        }, status=201)