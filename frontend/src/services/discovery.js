import api from "./api";


// ============================================================
// HOME
// ============================================================

export const getHome = async (
  profileId
) => {

  const response =
    await api.get(
      "/home/",
      {
        params: {
          profile_id: profileId,
        },
      }
    );


  return response.data;
};


// ============================================================
// SEARCH
// ============================================================

export const searchContent = async (
  query,
  profileId = null,
  filters = {}
) => {

  const params = {
    q: query,
  };


  if (profileId) {

    params.profile_id =
      profileId;

  }


  if (
    filters.type &&
    filters.type !== "all"
  ) {

    params.type =
      filters.type;

  }


  if (filters.genre) {

    params.genre =
      filters.genre;

  }


  if (filters.year) {

    params.year =
      filters.year;

  }


  if (filters.sort) {

    params.sort =
      filters.sort;

  }


  const response =
    await api.get(
      "/search/",
      {
        params,
      }
    );


  return response.data;
};