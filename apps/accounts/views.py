from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework import status
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework.views import APIView

from .models import User
from .serializers import RegisterSerializer, UserSerializer
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)


class RegisterView(generics.CreateAPIView):

    queryset = User.objects.all()

    serializer_class = RegisterSerializer

    permission_classes = [
        permissions.AllowAny
    ]

    def create(self, request, *args, **kwargs):

        serializer = self.get_serializer(
            data=request.data
        )

        serializer.is_valid(
            raise_exception=True
        )

        user = serializer.save()

        return Response(
            {
                "message": "Account created successfully.",
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED
        )


class LoginView(TokenObtainPairView):
    pass

class MeView(generics.RetrieveUpdateAPIView):

    serializer_class = UserSerializer

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):

    permission_classes = [
        permissions.IsAuthenticated
    ]

    def post(self, request):

        refresh_token = request.data.get(
            "refresh"
        )

        if not refresh_token:

            return Response(
                {
                    "error": "Refresh token is required."
                },
                status=status.HTTP_400_BAD_REQUEST
            )

        try:

            token = RefreshToken(refresh_token)

            token.blacklist()

            return Response(
                {
                    "message": "Logout successful."
                },
                status=status.HTTP_205_RESET_CONTENT
            )

        except Exception:

            return Response(
                {
                    "error": "Invalid refresh token."
                },
                status=status.HTTP_400_BAD_REQUEST
            )    