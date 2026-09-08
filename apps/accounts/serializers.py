from django.contrib.auth import get_user_model
from rest_framework import serializers


User = get_user_model()


class RegisterSerializer(serializers.ModelSerializer):

    password = serializers.CharField(
        write_only=True,
        min_length=8
    )

    password_confirm = serializers.CharField(
        write_only=True
    )

    class Meta:
        model = User

        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "password",
            "password_confirm",
        ]

        read_only_fields = [
            "id",
        ]

    def validate_email(self, value):

        if User.objects.filter(
            email__iexact=value
        ).exists():

            raise serializers.ValidationError(
                "Email already exists."
            )

        return value.lower()

    def validate(self, attrs):

        if attrs["password"] != attrs["password_confirm"]:
            raise serializers.ValidationError({
                "password_confirm": "Passwords do not match."
            })

        return attrs

    def create(self, validated_data):

        validated_data.pop("password_confirm")

        password = validated_data.pop("password")

        user = User.objects.create_user(
            password=password,
            **validated_data
        )

        return user


class UserSerializer(serializers.ModelSerializer):

    class Meta:
        model = User

        fields = [
            "id",
            "email",
            "first_name",
            "last_name",
            "date_joined",
        ]

        read_only_fields = [
            "id",
            "email",
            "date_joined",
        ]    