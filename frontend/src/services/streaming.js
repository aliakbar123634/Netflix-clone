// import api from "./api";


// // ============================================================
// // GET MOVIE STREAM
// // ============================================================

// export const getMovieStream = async (
//   movieId,
//   profileId
// ) => {

//   const response =
//     await api.get(
//       `/stream/movies/${movieId}/`,
//       {
//         params: {
//           profile_id: profileId,
//         },
//       }
//     );

//   return response.data;
// };


// // ============================================================
// // GET EPISODE STREAM
// // ============================================================

// export const getEpisodeStream = async (
//   episodeId,
//   profileId
// ) => {

//   const response =
//     await api.get(
//       `/stream/episodes/${episodeId}/`,
//       {
//         params: {
//           profile_id: profileId,
//         },
//       }
//     );

//   return response.data;
// };


// // ============================================================
// // GET STREAM BASED ON CONTENT TYPE
// // ============================================================

// export const getStream = async (
//   type,
//   contentId,
//   profileId
// ) => {

//   if (type === "movie") {

//     return getMovieStream(
//       contentId,
//       profileId
//     );

//   }

//   if (type === "episode") {

//     return getEpisodeStream(
//       contentId,
//       profileId
//     );

//   }

//   throw new Error(
//     "Unsupported streaming content type."
//   );

// };







import api from "./api";


// ============================================================
// GET MOVIE STREAM
// ============================================================

export const getMovieStream = async (
  movieId,
  profileId
) => {

  const response = await api.get(
    `/stream/movies/${movieId}/`,
    {
      params: {
        profile_id: profileId,
      },
    }
  );

  return response.data;
};


// ============================================================
// GET EPISODE STREAM
// ============================================================

export const getEpisodeStream = async (
  episodeId,
  profileId
) => {

  const response = await api.get(
    `/stream/episodes/${episodeId}/`,
    {
      params: {
        profile_id: profileId,
      },
    }
  );

  return response.data;
};


// ============================================================
// GET STREAM BASED ON CONTENT TYPE
// ============================================================

export const getStream = async (
  type,
  contentId,
  profileId
) => {

  if (type === "movie") {

    return getMovieStream(
      contentId,
      profileId
    );

  }

  if (type === "episode") {

    return getEpisodeStream(
      contentId,
      profileId
    );

  }

  throw new Error(
    "Unsupported streaming content type."
  );
};