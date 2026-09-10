import api from "./api";


// ============================================================
// GET MY LIST
// ============================================================

export const getMyList = async (
  profileId
) => {

  const response =
    await api.get(
      "/my-list/",
      {
        params: {
          profile_id: profileId,
        },
      }
    );


  return response.data;
};


// ============================================================
// ADD TO MY LIST
// ============================================================

export const addToMyList = async (
  profileId,
  contentType,
  contentId
) => {

  const response =
    await api.post(
      "/my-list/",
      {
        profile_id: profileId,
        content_type: contentType,
        content_id: contentId,
      }
    );


  return response.data;
};


// ============================================================
// REMOVE FROM MY LIST
// ============================================================

export const removeFromMyList = async (
  itemId
) => {

  const response =
    await api.delete(
      `/my-list/${itemId}/`
    );


  return response.data;
};