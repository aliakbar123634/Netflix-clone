import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  loginUser,
  registerUser,
  getCurrentUser,
} from "../services/auth";

import {
  storage,
} from "../utils/storage";


const AuthContext =
  createContext(null);


export const AuthProvider = ({
  children,
}) => {

  const [user, setUser] =
    useState(null);

  const [loading, setLoading] =
    useState(true);


  // ==========================================================
  // CHECK AUTH ON APP START
  // ==========================================================

  useEffect(() => {

    const initializeAuth =
      async () => {

        const token =
          storage.getAccessToken();

        if (!token) {

          setLoading(false);

          return;
        }

        try {

          const currentUser =
            await getCurrentUser();

          setUser(
            currentUser
          );

        } catch {

          storage.clearAuth();

          setUser(null);

        } finally {

          setLoading(false);

        }
      };


    initializeAuth();

  }, []);


  // ==========================================================
  // LOGIN
  // ==========================================================

  const login = async (
    credentials
  ) => {

    const data =
      await loginUser(
        credentials
      );


    if (data.access) {

      storage.setAccessToken(
        data.access
      );

    }

    if (data.refresh) {

      storage.setRefreshToken(
        data.refresh
      );

    }


    // If backend returns user
    if (data.user) {

      setUser(
        data.user
      );

    } else {

      try {

        const currentUser =
          await getCurrentUser();

        setUser(
          currentUser
        );

      } catch {

        setUser(null);

      }

    }

    return data;
  };


  // ==========================================================
  // REGISTER
  // ==========================================================

  const register = async (
    userData
  ) => {

    const data =
      await registerUser(
        userData
      );

    return data;
  };


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const logout = () => {

    storage.clearAuth();

    setUser(null);

  };


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {

    user,

    loading,

    isAuthenticated:
      Boolean(user),

    login,

    register,

    logout,

  };


  return (

    <AuthContext.Provider
      value={value}
    >

      {children}

    </AuthContext.Provider>

  );
};


// ============================================================
// CUSTOM HOOK
// ============================================================

export const useAuth = () => {

  const context =
    useContext(
      AuthContext
    );

  if (!context) {

    throw new Error(
      "useAuth must be used inside AuthProvider"
    );

  }

  return context;
};