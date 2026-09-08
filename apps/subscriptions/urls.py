from django.urls import path

from apps.subscriptions.views import (
    PlanListView,
    CurrentSubscriptionView,
    SubscriptionHistoryView,
    ActivateSubscriptionView,
)


urlpatterns = [

    path(
        "plans/",
        PlanListView.as_view(),
        name="subscription-plans"
    ),

    path(
        "current/",
        CurrentSubscriptionView.as_view(),
        name="current-subscription"
    ),

    path(
        "history/",
        SubscriptionHistoryView.as_view(),
        name="subscription-history"
    ),

    path(
        "activate/",
        ActivateSubscriptionView.as_view(),
        name="activate-subscription"
    ),
]