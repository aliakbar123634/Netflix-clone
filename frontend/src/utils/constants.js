export const APP_NAME = "StreamFlix";

export const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ||
  "http://127.0.0.1:8000/api";

export const STORAGE_KEYS = {
  ACCESS_TOKEN: "streamflix_access_token",
  REFRESH_TOKEN: "streamflix_refresh_token",
  PROFILE: "streamflix_profile",
};