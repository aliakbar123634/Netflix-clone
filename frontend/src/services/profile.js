import api from "./api";


// ============================================================
// GET PROFILES
// ============================================================

export const getProfiles = async () => {

  const response = await api.get(
    "/profiles/"
  );

  return response.data;
};


// ============================================================
// GET PROFILE
// ============================================================

export const getProfile = async (
  profileId
) => {

  const response = await api.get(
    `/profiles/${profileId}/`
  );

  return response.data;
};


// ============================================================
// CREATE PROFILE
// ============================================================

export const createProfile = async (
  profileData
) => {

  const response = await api.post(
    "/profiles/",
    profileData
  );

  return response.data;
};


// ============================================================
// UPDATE PROFILE
// ============================================================

export const updateProfile = async (
  profileId,
  profileData
) => {

  const response = await api.patch(
    `/profiles/${profileId}/`,
    profileData
  );

  return response.data;
};


// ============================================================
// DELETE PROFILE
// ============================================================

export const deleteProfile = async (
  profileId
) => {

  const response = await api.delete(
    `/profiles/${profileId}/`
  );

  return response.data;
};