from rest_framework import generics
from rest_framework.permissions import IsAuthenticated

from .models import MyList
from .serializers import MyListSerializer


class MyListView(generics.ListCreateAPIView):

    serializer_class = MyListSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return MyList.objects.filter(
            profile__user=self.request.user
        ).select_related(
            "profile",
            "content_type",
        )

    def get_serializer_context(self):

        context = super().get_serializer_context()

        profile_id = self.request.data.get(
            "profile_id"
        )

        if self.request.method == "GET":

            profile_id = self.request.query_params.get(
                "profile_id"
            )

        if not profile_id:

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                "profile_id": "Profile ID is required."
            })

        try:

            profile = self.request.user.profiles.get(
                id=profile_id,
                is_active=True,
            )

        except Exception:

            from rest_framework.exceptions import ValidationError

            raise ValidationError({
                "profile_id": "Invalid profile."
            })

        context["profile"] = profile

        return context


class MyListDeleteView(generics.DestroyAPIView):

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return MyList.objects.filter(
            profile__user=self.request.user
        )