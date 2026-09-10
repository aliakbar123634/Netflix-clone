import {
  useState,
  useRef,
  useEffect,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";

import {
  useProfile,
} from "../../context/ProfileContext";


const AccountMenu = () => {

  const [isOpen, setIsOpen] =
    useState(false);

  const menuRef =
    useRef(null);

  const navigate =
    useNavigate();

  const {
    user,
    logout,
  } = useAuth();

  const {
    profile,
    clearProfile,
  } = useProfile();


  // ==========================================================
  // CLOSE WHEN CLICKING OUTSIDE
  // ==========================================================

  useEffect(() => {

    const handleClickOutside = (
      event
    ) => {

      if (
        menuRef.current &&
        !menuRef.current.contains(
          event.target
        )
      ) {

        setIsOpen(false);

      }

    };


    document.addEventListener(
      "mousedown",
      handleClickOutside
    );


    return () => {

      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );

    };

  }, []);


  // ==========================================================
  // LOGOUT
  // ==========================================================

  const handleLogout = () => {

    clearProfile();

    logout();

    setIsOpen(false);

    navigate("/login");

  };


  // ==========================================================
  // AVATAR
  // ==========================================================

  const avatarUrl =
    profile?.avatar || null;


  const profileName =
    profile?.name ||
    user?.email?.split("@")[0] ||
    "Profile";


  return (

    <div
      className="account-menu"
      ref={menuRef}
    >

      <button
        type="button"
        className="profile-trigger"
        onClick={() =>
          setIsOpen(
            previous => !previous
          )
        }
        aria-label="Open account menu"
        aria-expanded={isOpen}
      >

        {avatarUrl ? (

          <img
            src={avatarUrl}
            alt={profileName}
            className="profile-avatar"
          />

        ) : (

          <div className="profile-avatar profile-avatar-fallback">
            {profileName
              .charAt(0)
              .toUpperCase()
            }
          </div>

        )}

        <span
          className={`profile-chevron ${
            isOpen
              ? "profile-chevron-open"
              : ""
          }`}
        >
          ▼
        </span>

      </button>


      {isOpen && (

        <div className="account-dropdown">

          <div className="account-user">

            <div className="account-user-avatar">

              {avatarUrl ? (

                <img
                  src={avatarUrl}
                  alt={profileName}
                />

              ) : (

                profileName
                  .charAt(0)
                  .toUpperCase()

              )}

            </div>


            <div className="account-user-info">

              <strong>
                {profileName}
              </strong>

              <span>
                {user?.email || ""}
              </span>

            </div>

          </div>


          <div className="dropdown-divider" />


          <Link
            to="/profiles"
            className="dropdown-item"
            onClick={() =>
              setIsOpen(false)
            }
          >

            <span>
              👤
            </span>

            Manage Profiles

          </Link>


          <Link
            to="/subscription"
            className="dropdown-item"
            onClick={() =>
              setIsOpen(false)
            }
          >

            <span>
              💳
            </span>

            Account

          </Link>


          <Link
            to="/settings"
            className="dropdown-item"
            onClick={() =>
              setIsOpen(false)
            }
          >

            <span>
              ⚙
            </span>

            Settings

          </Link>


          <div className="dropdown-divider" />


          <button
            type="button"
            className="dropdown-item dropdown-logout"
            onClick={handleLogout}
          >

            <span>
              ↪
            </span>

            Sign out

          </button>

        </div>

      )}

    </div>

  );

};


export default AccountMenu;