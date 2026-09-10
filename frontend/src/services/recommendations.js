import api from "./api";


// ============================================================
// GET PERSONALIZED RECOMMENDATIONS
// ============================================================

export const getRecommendations = async (
  profileId
) => {

  if (!profileId) {
    throw new Error(
      "Profile ID is required for recommendations."
    );
  }

  const response = await api.get(
    "/recommendations/",
    {
      params: {
        profile_id: profileId,
      },
    }
  );

  return response.data;
};