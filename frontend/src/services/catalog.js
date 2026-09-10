import api from "./api";


// ============================================================
// HELPER
// ============================================================

const extractList = (data) => {

  if (Array.isArray(data)) {
    return data;
  }


  if (Array.isArray(data?.results)) {
    return data.results;
  }


  return [];
};


// ============================================================
// MOVIES
// ============================================================

export const getMovies = async (
  params = {}
) => {

  const response =
    await api.get(
      "/catalog/movies/",
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// MOVIE DETAIL
// ============================================================

export const getMovie = async (
  movieId
) => {

  const response =
    await api.get(
      `/catalog/movies/${movieId}/`
    );


  return response.data;
};


// ============================================================
// MOVIE LIST
// ============================================================

export const getMoviesList = async (
  params = {}
) => {

  const data =
    await getMovies(
      params
    );


  return extractList(
    data
  );
};


// ============================================================
// SIMILAR TO MOVIE
// ============================================================

export const getSimilarMovieContent = async (
  movieId,
  profileId = null
) => {

  const params = {};

  if (profileId) {

    params.profile_id =
      profileId;

  }


  const response =
    await api.get(
      `/catalog/movies/${movieId}/similar/`,
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// TV SHOWS
// ============================================================

export const getTVShows = async (
  params = {}
) => {

  const response =
    await api.get(
      "/catalog/shows/",
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// TV SHOW DETAIL
// ============================================================

export const getTVShow = async (
  showId
) => {

  const response =
    await api.get(
      `/catalog/shows/${showId}/`
    );


  return response.data;
};


// ============================================================
// TV SHOW LIST
// ============================================================

export const getTVShowsList = async (
  params = {}
) => {

  const data =
    await getTVShows(
      params
    );


  return extractList(
    data
  );
};


// ============================================================
// SIMILAR TO TV SHOW
// ============================================================

export const getSimilarTVShowContent = async (
  showId,
  profileId = null
) => {

  const params = {};

  if (profileId) {

    params.profile_id =
      profileId;

  }


  const response =
    await api.get(
      `/catalog/shows/${showId}/similar/`,
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// GENRES
// ============================================================

export const getGenres = async () => {

  const response =
    await api.get(
      "/catalog/genres/"
    );


  return response.data;
};


// ============================================================
// GENRES LIST
// ============================================================

export const getGenresList = async () => {

  const data =
    await getGenres();


  return extractList(
    data
  );
};


// ============================================================
// PEOPLE
// ============================================================

export const getPeople = async (
  params = {}
) => {

  const response =
    await api.get(
      "/catalog/people/",
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// PEOPLE LIST
// ============================================================

export const getPeopleList = async (
  params = {}
) => {

  const data =
    await getPeople(
      params
    );


  return extractList(
    data
  );
};


// ============================================================
// SEASONS
// ============================================================

export const getSeasons = async (
  params = {}
) => {

  const response =
    await api.get(
      "/catalog/seasons/",
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// SEASONS LIST
// ============================================================

export const getSeasonsList = async (
  params = {}
) => {

  const data =
    await getSeasons(
      params
    );


  return extractList(
    data
  );
};


// ============================================================
// EPISODES
// ============================================================

export const getEpisodes = async (
  params = {}
) => {

  const response =
    await api.get(
      "/catalog/episodes/",
      {
        params,
      }
    );


  return response.data;
};


// ============================================================
// EPISODES LIST
// ============================================================

export const getEpisodesList = async (
  params = {}
) => {

  const data =
    await getEpisodes(
      params
    );


  return extractList(
    data
  );
};