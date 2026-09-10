import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  useProfile,
} from "../../context/ProfileContext";

import ProfileCard
  from "../../components/profile/ProfileCard";

import AddProfileCard
  from "../../components/profile/AddProfileCard";

import ProfileModal
  from "../../components/profile/ProfileModal";


const Profiles = () => {

  const navigate =
    useNavigate();


  const {

    profiles,

    profile,

    loading,

    error,

    fetchProfiles,

    selectProfile,

    createProfile,

    updateProfile,

    deleteProfile,

  } = useProfile();


  const [
    manageMode,
    setManageMode,
  ] = useState(false);


  const [
    modalOpen,
    setModalOpen,
  ] = useState(false);


  const [
    selectedForEdit,
    setSelectedForEdit,
  ] = useState(null);


  // ==========================================================
  // LOAD
  // ==========================================================

  useEffect(() => {

    fetchProfiles()
      .catch(() => {});

  }, []);


  // ==========================================================
  // PROFILE SELECT
  // ==========================================================

  const handleProfileSelect = (
    selectedProfile
  ) => {

    if (manageMode) {

      setSelectedForEdit(
        selectedProfile
      );

      setModalOpen(
        true
      );

      return;

    }


    selectProfile(
      selectedProfile
    );


    navigate(
      "/home"
    );

  };


  // ==========================================================
  // ADD
  // ==========================================================

  const handleAddProfile = () => {

    setSelectedForEdit(
      null
    );

    setModalOpen(
      true
    );

  };


  // ==========================================================
  // SAVE
  // ==========================================================

  const handleSave = async (
    data
  ) => {

    if (selectedForEdit) {

      await updateProfile(
        selectedForEdit.id,
        data
      );

    } else {

      await createProfile(
        data
      );

    }


    setModalOpen(
      false
    );


    setSelectedForEdit(
      null
    );

  };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete = async (
    profileId
  ) => {

    await deleteProfile(
      profileId
    );

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (
    loading &&
    profiles.length === 0
  ) {

    return (

      <main className="profiles-page">

        <div className="profiles-loading">

          <div className="profiles-loader"></div>

          <p>
            Loading profiles...
          </p>

        </div>

      </main>

    );

  }


  return (

    <main
      className={
        profile?.is_kids
          ? "profiles-page profiles-kids-page"
          : "profiles-page"
      }
    >

      <div className="profiles-page-background"></div>


      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <section className="profiles-header">

        <span className="profiles-brand">
          STREAMFLIX
        </span>


        <h1>
          Who's watching?
        </h1>


        <p>
          Choose a profile to continue.
        </p>

      </section>


      {error && (

        <div
          className="profiles-error"
          role="alert"
        >
          {error}
        </div>

      )}


      {/* ==================================================== */}
      {/* PROFILES */}
      {/* ==================================================== */}

      <section className="profiles-grid">

        {profiles.map(
          item => (

            <ProfileCard
              key={item.id}
              profile={item}
              onSelect={
                handleProfileSelect
              }
              editMode={
                manageMode
              }
            />

          )
        )}


        <AddProfileCard
          onClick={
            handleAddProfile
          }
        />

      </section>


      {/* ==================================================== */}
      {/* MANAGE */}
      {/* ==================================================== */}

      <div className="profiles-manage">

        <button
          type="button"
          className={
            manageMode
              ? "manage-profiles-button active"
              : "manage-profiles-button"
          }
          onClick={() =>
            setManageMode(
              previous =>
                !previous
            )
          }
        >

          {manageMode
            ? "Done"
            : "Manage Profiles"
          }

        </button>

      </div>


      {/* ==================================================== */}
      {/* CURRENT PROFILE */}
      {/* ==================================================== */}

      {profile && !manageMode && (

        <div className="profiles-current">

          Last selected:

          {" "}

          <strong>
            {profile.name}
          </strong>

          {profile.is_kids && (

            <span className="profiles-current-kids">
              KIDS
            </span>

          )}

        </div>

      )}


      {/* ==================================================== */}
      {/* MODAL */}
      {/* ==================================================== */}

      {modalOpen && (

        <ProfileModal

          profile={
            selectedForEdit
          }

          onClose={() => {

            setModalOpen(
              false
            );

            setSelectedForEdit(
              null
            );

          }}

          onSave={
            handleSave
          }

          onDelete={
            handleDelete
          }

          loading={
            loading
          }

        />

      )}

    </main>

  );

};


export default Profiles;