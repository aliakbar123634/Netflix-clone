import api from "./api";


// ============================================================
// WATCH HISTORY
// ============================================================

export const getWatchHistory = async (
  params = {}
) => {
  const response = await api.get(
    "/history/",
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// DELETE HISTORY ITEM
// ============================================================

export const deleteHistoryItem = async (
  historyId
) => {
  const response = await api.delete(
    `/history/${historyId}/`
  );

  return response.data;
};


// ============================================================
// WATCH PROGRESS
// ============================================================

export const updateWatchProgress = async (
  progressData
) => {
  const response = await api.post(
    "/history/watch-progress/",
    progressData
  );

  return response.data;
};


// ============================================================
// GET WATCH PROGRESS
// ============================================================

export const getWatchProgress = async (
  params = {}
) => {
  const response = await api.get(
    "/history/watch-progress/",
    {
      params,
    }
  );

  return response.data;
};


// ============================================================
// CONTINUE WATCHING
// ============================================================

export const getContinueWatching = async (
  profileId
) => {
  const response = await api.get(
    "/history/continue-watching/",
    {
      params: {
        profile_id: profileId,
      },
    }
  );

  return response.data;
};