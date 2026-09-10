import axios from "axios";

import {
  API_BASE_URL
} from "../utils/constants";

import { storage } from "../utils/storage";


const api = axios.create({

  baseURL: API_BASE_URL,

  headers: {
    "Content-Type": "application/json",
  },

  timeout: 15000,
});


// ============================================================
// REQUEST INTERCEPTOR
// ============================================================

api.interceptors.request.use(

  (config) => {

    const token =
      storage.getAccessToken();

    if (token) {

      config.headers.Authorization =
        `Bearer ${token}`;

    }

    return config;
  },

  (error) => {

    return Promise.reject(error);

  }
);


// ============================================================
// RESPONSE INTERCEPTOR
// ============================================================

api.interceptors.response.use(

  (response) => {

    return response;

  },

  (error) => {

    if (
      error.response?.status === 401
    ) {

      storage.clearAuth();

      // We don't redirect here.
      // React Router will handle it.

    }

    return Promise.reject(error);

  }
);


export default api;