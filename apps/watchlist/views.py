# # from rest_framework import generics
# # from rest_framework.permissions import IsAuthenticated

# # from .models import MyList
# # from .serializers import MyListSerializer


# # class MyListView(generics.ListCreateAPIView):

# #     serializer_class = MyListSerializer

# #     permission_classes = [
# #         IsAuthenticated
# #     ]

# #     def get_queryset(self):

# #         return MyList.objects.filter(
# #             profile__user=self.request.user
# #         ).select_related(
# #             "profile",
# #             "content_type",
# #         )

# #     def get_serializer_context(self):

# #         context = super().get_serializer_context()

# #         profile_id = self.request.data.get(
# #             "profile_id"
# #         )

# #         if self.request.method == "GET":

# #             profile_id = self.request.query_params.get(
# #                 "profile_id"
# #             )

# #         if not profile_id:

# #             from rest_framework.exceptions import ValidationError

# #             raise ValidationError({
# #                 "profile_id": "Profile ID is required."
# #             })

# #         try:

# #             profile = self.request.user.profiles.get(
# #                 id=profile_id,
# #                 is_active=True,
# #             )

# #         except Exception:

# #             from rest_framework.exceptions import ValidationError

# #             raise ValidationError({
# #                 "profile_id": "Invalid profile."
# #             })

# #         context["profile"] = profile

# #         return context


# # class MyListDeleteView(generics.DestroyAPIView):

# #     permission_classes = [
# #         IsAuthenticated
# #     ]

# #     def get_queryset(self):

# #         return MyList.objects.filter(
# #             profile__user=self.request.user
# #         )


# from rest_framework import generics
# from rest_framework.permissions import IsAuthenticated
# from rest_framework.exceptions import ValidationError

# from .models import MyList
# from .serializers import MyListSerializer


# class MyListView(
#     generics.ListCreateAPIView
# ):

#     serializer_class = MyListSerializer

#     permission_classes = [
#         IsAuthenticated
#     ]


#     def get_queryset(self):

#         return (
#             MyList.objects
#             .filter(
#                 profile__user=self.request.user
#             )
#             .select_related(
#                 "profile",
#                 "content_type",
#             )
#         )


#     def get_serializer_context(self):

#         context = super().get_serializer_context()


#         if self.request.method == "GET":

#             profile_id =self.request.query_params.get(
#                     "profile_id"
#                 )

#         else:

#             profile_id =self.request.data.get(
#                     "profile_id"
#                 )


#         if not profile_id:

#             raise ValidationError({
#                 "profile_id":
#                     "Profile ID is required."
#             })


#         try:

#             profile =self.request.user.profiles.get(
#                     id=profile_id,
#                     is_active=True,
#                 )

#         except Exception:

#             raise ValidationError({
#                 "profile_id":
#                     "Invalid profile."
#             })


#         context["profile"] = profile


#         return context


# class MyListDeleteView(
#     generics.DestroyAPIView
# ):

#     permission_classes = [
#         IsAuthenticated
#     ]


#     def get_queryset(self):

#         return MyList.objects.filter(
#             profile__user=self.request.user
#         )






from rest_framework import generics
from rest_framework.permissions import IsAuthenticated
from rest_framework.exceptions import ValidationError

from .models import MyList
from .serializers import MyListSerializer

from apps.profiles.models import Profile


# ============================================================
# MY LIST
# ============================================================

class MyListView(
    generics.ListCreateAPIView
):

    serializer_class = MyListSerializer

    permission_classes = [
        IsAuthenticated
    ]


    # ========================================================
    # GET PROFILE ID
    # ========================================================

    def get_profile_id(self):

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

            raise ValidationError({
                "profile_id":
                    "Profile ID is required."
            })

        return profile_id


    # ========================================================
    # GET ACTIVE USER PROFILE
    # ========================================================

    def get_profile(self):

        profile_id = self.get_profile_id()

        try:

            profile = Profile.objects.get(
                id=profile_id,
                user=self.request.user,
                is_active=True,
            )

        except Profile.DoesNotExist:

            raise ValidationError({
                "profile_id":
                    "Invalid profile."
            })

        return profile


    # ========================================================
    # QUERYSET
    # ========================================================

    def get_queryset(self):

        profile = self.get_profile()

        return (
            MyList.objects
            .filter(
                profile=profile
            )
            .select_related(
                "profile",
                "content_type",
            )
        )


    # ========================================================
    # SERIALIZER CONTEXT
    # ========================================================

    def get_serializer_context(self):

        context = (
            super().get_serializer_context()
        )

        context["profile"] = (
            self.get_profile()
        )

        return context


# ============================================================
# DELETE MY LIST ITEM
# ============================================================

class MyListDeleteView(
    generics.DestroyAPIView
):

    permission_classes = [
        IsAuthenticated
    ]


    # ========================================================
    # GET PROFILE
    # ========================================================

    def get_profile(self):

        profile_id = (
            self.request.query_params.get(
                "profile_id"
            )
        )

        if not profile_id:

            raise ValidationError({
                "profile_id":
                    "Profile ID is required."
            })

        try:

            profile = Profile.objects.get(
                id=profile_id,
                user=self.request.user,
                is_active=True,
            )

        except Profile.DoesNotExist:

            raise ValidationError({
                "profile_id":
                    "Invalid profile."
            })

        return profile


    # ========================================================
    # QUERYSET
    # ========================================================

    def get_queryset(self):

        profile = self.get_profile()

        return MyList.objects.filter(
            profile=profile
        )