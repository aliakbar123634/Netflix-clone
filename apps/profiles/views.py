from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework import generics, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Profile
from .serializers import ProfileSerializer

from .models import Profile
from .serializers import ProfileSerializer


class ProfileListCreateView(generics.ListCreateAPIView):

    serializer_class = ProfileSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Profile.objects.filter(
            user=self.request.user
        )


class ProfileDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ProfileSerializer

    permission_classes = [
        IsAuthenticated
    ]

    def get_queryset(self):

        return Profile.objects.filter(
            user=self.request.user
        )

class ProfileListCreateView(generics.ListCreateAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(
            user=self.request.user
        )


class ProfileDetailView(generics.RetrieveUpdateDestroyAPIView):

    serializer_class = ProfileSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        return Profile.objects.filter(
            user=self.request.user
        )


class VerifyProfilePINView(APIView):

    permission_classes = [IsAuthenticated]

    def post(self, request, pk):

        try:
            profile = Profile.objects.get(
                pk=pk,
                user=request.user
            )

        except Profile.DoesNotExist:

            return Response(
                {
                    "error": "Profile not found."
                },
                status=status.HTTP_404_NOT_FOUND
            )

        pin = request.data.get("pin")

        if not pin:

            return Response(
                {
                    "error": "PIN is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        if profile.check_pin(pin):

            return Response(
                {
                    "message": "Profile unlocked.",
                    "profile_id": profile.id
                },
                status=status.HTTP_200_OK
            )

        return Response(
            {
                "error": "Invalid PIN."
            },
            status=status.HTTP_401_UNAUTHORIZED
        )    