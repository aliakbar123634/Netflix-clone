import {
  createContext,
  useContext,
  useState,
} from "react";

import {
  getProfiles,
  createProfile as createProfileApi,
  updateProfile as updateProfileApi,
  deleteProfile as deleteProfileApi,
} from "../services/profile";


const ProfileContext =
  createContext(null);


// ============================================================
// PROFILE PROVIDER
// ============================================================

export const ProfileProvider = ({
  children,
}) => {

  // ==========================================================
  // STATE
  // ==========================================================

  const [
    profiles,
    setProfiles,
  ] = useState([]);


  const [
    profile,
    setProfile,
  ] = useState(() => {

    const saved =
      localStorage.getItem(
        "streamflix_profile"
      );


    if (!saved) {
      return null;
    }


    try {

      return JSON.parse(
        saved
      );

    } catch {

      localStorage.removeItem(
        "streamflix_profile"
      );

      return null;

    }

  });


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // FETCH PROFILES
  // ==========================================================

  const fetchProfiles = async () => {

    setLoading(true);
    setError("");


    try {

      const data =
        await getProfiles();


      const profileList =
        Array.isArray(data)
          ? data
          : data?.results || [];


      setProfiles(
        profileList
      );


      return profileList;

    } catch (error) {

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to load profiles.";


      setError(
        message
      );


      throw error;

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // SELECT PROFILE
  // ==========================================================

  const selectProfile = (
    selectedProfile
  ) => {

    setProfile(
      selectedProfile
    );


    localStorage.setItem(
      "streamflix_profile",
      JSON.stringify(
        selectedProfile
      )
    );

  };


  // ==========================================================
  // CLEAR PROFILE
  // ==========================================================

  const clearProfile = () => {

    setProfile(null);


    localStorage.removeItem(
      "streamflix_profile"
    );

  };


  // ==========================================================
  // CREATE PROFILE
  // ==========================================================

  const createProfile = async (
    data
  ) => {

    setLoading(true);
    setError("");


    try {

      const newProfile =
        await createProfileApi(
          data
        );


      setProfiles(
        previous => [
          ...previous,
          newProfile,
        ]
      );


      return newProfile;

    } catch (error) {

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to create profile.";


      setError(
        message
      );


      throw error;

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // UPDATE PROFILE
  // ==========================================================

  const updateProfile = async (
    profileId,
    data
  ) => {

    setLoading(true);
    setError("");


    try {

      const updatedProfile =
        await updateProfileApi(
          profileId,
          data
        );


      setProfiles(
        previous =>
          previous.map(
            item =>
              Number(item.id) ===
              Number(profileId)
                ? updatedProfile
                : item
          )
      );


      // ------------------------------------------------------
      // If currently selected profile was updated
      // ------------------------------------------------------

      if (
        profile &&
        Number(profile.id) ===
        Number(profileId)
      ) {

        selectProfile(
          updatedProfile
        );

      }


      return updatedProfile;

    } catch (error) {

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to update profile.";


      setError(
        message
      );


      throw error;

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // DELETE PROFILE
  // ==========================================================

  const deleteProfile = async (
    profileId
  ) => {

    setLoading(true);
    setError("");


    try {

      await deleteProfileApi(
        profileId
      );


      setProfiles(
        previous =>
          previous.filter(
            item =>
              Number(item.id) !==
              Number(profileId)
          )
      );


      // ------------------------------------------------------
      // If selected profile was deleted
      // ------------------------------------------------------

      if (
        profile &&
        Number(profile.id) ===
        Number(profileId)
      ) {

        clearProfile();

      }

    } catch (error) {

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to delete profile.";


      setError(
        message
      );


      throw error;

    } finally {

      setLoading(false);

    }

  };


  // ==========================================================
  // CONTEXT VALUE
  // ==========================================================

  const value = {

    profiles,

    profile,

    loading,

    error,

    fetchProfiles,

    selectProfile,

    clearProfile,

    createProfile,

    updateProfile,

    deleteProfile,

  };


  // ==========================================================
  // PROVIDER
  // ==========================================================

  return (

    <ProfileContext.Provider
      value={value}
    >

      {children}

    </ProfileContext.Provider>

  );

};


// ============================================================
// CUSTOM HOOK
// ============================================================

export const useProfile = () => {

  const context =
    useContext(
      ProfileContext
    );


  if (!context) {

    throw new Error(
      "useProfile must be used inside ProfileProvider"
    );

  }


  return context;

};