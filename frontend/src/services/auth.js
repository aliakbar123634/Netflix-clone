import api from "./api";


// ============================================================
// LOGIN
// ============================================================

export const loginUser = async (
  credentials
) => {

  const response =
    await api.post(
      "/auth/login/",
      credentials
    );

  return response.data;
};


// ============================================================
// REGISTER
// ============================================================

export const registerUser = async (
  userData
) => {

  const response =
    await api.post(
      "/auth/register/",
      userData
    );

  return response.data;
};


// ============================================================
// CURRENT USER
// ============================================================

export const getCurrentUser = async () => {

  const response =
    await api.get(
      "/auth/me/"
    );

  return response.data;
};


// ============================================================
// REFRESH ACCESS TOKEN
// ============================================================

export const refreshAccessToken = async (
  refresh
) => {

  const response =
    await api.post(
      "/auth/refresh/",
      {
        refresh,
      }
    );

  return response.data;
};