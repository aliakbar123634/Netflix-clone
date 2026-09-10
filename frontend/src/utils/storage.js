import { STORAGE_KEYS } from "./constants";

export const storage = {

  getAccessToken() {
    return localStorage.getItem(
      STORAGE_KEYS.ACCESS_TOKEN
    );
  },

  setAccessToken(token) {
    localStorage.setItem(
      STORAGE_KEYS.ACCESS_TOKEN,
      token
    );
  },

  removeAccessToken() {
    localStorage.removeItem(
      STORAGE_KEYS.ACCESS_TOKEN
    );
  },

  getRefreshToken() {
    return localStorage.getItem(
      STORAGE_KEYS.REFRESH_TOKEN
    );
  },

  setRefreshToken(token) {
    localStorage.setItem(
      STORAGE_KEYS.REFRESH_TOKEN,
      token
    );
  },

  removeRefreshToken() {
    localStorage.removeItem(
      STORAGE_KEYS.REFRESH_TOKEN
    );
  },

  getProfile() {
    const profile = localStorage.getItem(
      STORAGE_KEYS.PROFILE
    );

    if (!profile) {
      return null;
    }

    try {
      return JSON.parse(profile);
    } catch {
      return null;
    }
  },

  setProfile(profile) {
    localStorage.setItem(
      STORAGE_KEYS.PROFILE,
      JSON.stringify(profile)
    );
  },

  removeProfile() {
    localStorage.removeItem(
      STORAGE_KEYS.PROFILE
    );
  },

  clearAuth() {
    this.removeAccessToken();
    this.removeRefreshToken();
    this.removeProfile();
  },
};