from rest_framework import serializers

from .models import Profile


class ProfileSerializer(serializers.ModelSerializer):

    avatar_url = serializers.SerializerMethodField()

    pin = serializers.CharField(
        write_only=True,
        required=False,
        allow_blank=True,
        min_length=4,
        max_length=4,
    )

    class Meta:
        model = Profile

        fields = [
            "id",
            "name",
            "avatar",
            "avatar_url",
            "is_kids",
            "language",
            "maturity_level",
            "pin",
            "is_active",
            "created_at",
            "updated_at",
        ]

        read_only_fields = [
            "id",
            "avatar_url",
            "is_active",
            "created_at",
            "updated_at",
        ]

    def get_avatar_url(self, obj):

        request = self.context.get("request")

        if not obj.avatar:
            return None

        if request:
            return request.build_absolute_uri(
                obj.avatar.url
            )

        return obj.avatar.url

    def validate_name(self, value):

        value = value.strip()

        if not value:
            raise serializers.ValidationError(
                "Profile name cannot be empty."
            )

        return value

    def validate_pin(self, value):

        if value and not value.isdigit():
            raise serializers.ValidationError(
                "PIN must contain only numbers."
            )

        return value

    def validate(self, attrs):

        request = self.context["request"]

        user = request.user

        if self.instance is None:

            if user.profiles.count() >= 5:

                raise serializers.ValidationError(
                    "Maximum 5 profiles are allowed."
                )

        name = attrs.get("name")

        if name:

            existing = Profile.objects.filter(
                user=user,
                name__iexact=name,
            )

            if self.instance:
                existing = existing.exclude(
                    id=self.instance.id
                )

            if existing.exists():

                raise serializers.ValidationError({
                    "name": "A profile with this name already exists."
                })

        return attrs

    def create(self, validated_data):

        pin = validated_data.pop(
            "pin",
            None
        )

        profile = Profile.objects.create(
            user=self.context["request"].user,
            **validated_data
        )

        if pin:
            profile.set_pin(pin)
            profile.save(update_fields=["pin"])

        return profile

    def update(self, instance, validated_data):

        pin = validated_data.pop(
            "pin",
            None
        )

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        if pin is not None:
            instance.set_pin(pin)

        instance.save()

        return instance