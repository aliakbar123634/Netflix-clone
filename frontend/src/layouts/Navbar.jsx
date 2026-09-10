import {
  Link,
  useNavigate,
  useLocation,
} from "react-router-dom";


import {
  useAuth,
} from "../../context/AuthContext";


import {
  useProfile,
} from "../../context/ProfileContext";


const Navbar = () => {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    logout,
  } = useAuth();


  const {
    profile,
    clearProfile,
  } = useProfile();


  const handleLogout = () => {

    clearProfile();

    logout();

    navigate(
      "/login",
      {
        replace: true,
      }
    );

  };


  const isActive = (path) => {

    return (
      location.pathname === path
    );

  };


  return (

    <header className="main-navbar">

      <div className="navbar-left">

        <Link
          to="/home"
          className="navbar-logo"
        >
          STREAMFLIX
        </Link>


        <nav className="navbar-links">

          <Link
            to="/home"
            className={
              isActive("/home")
                ? "active"
                : ""
            }
          >
            Home
          </Link>


          <Link
            to="/tv-shows"
            className={
              isActive("/tv-shows")
                ? "active"
                : ""
            }
          >
            TV Shows
          </Link>


          <Link
            to="/movies"
            className={
              isActive("/movies")
                ? "active"
                : ""
            }
          >
            Movies
          </Link>


          <Link
            to="/new-popular"
            className={
              isActive("/new-popular")
                ? "active"
                : ""
            }
          >
            New & Popular
          </Link>


          <Link
            to="/my-list"
            className={
              isActive("/my-list")
                ? "active"
                : ""
            }
          >
            My List
          </Link>


          <Link
            to="/subscription"
            className={
              isActive("/subscription")
                ? "active subscription-nav-link"
                : "subscription-nav-link"
            }
          >
            Plans
          </Link>

        </nav>

      </div>


      <div className="navbar-right">

        <button
          type="button"
          className="navbar-search-button"
          onClick={() =>
            navigate("/search")
          }
          aria-label="Search"
        >
          🔍
        </button>


        <button
          type="button"
          className="navbar-profile"
          onClick={() =>
            navigate("/profiles")
          }
          aria-label="Profiles"
        >

          <span className="navbar-profile-avatar">

            {profile?.name
              ?.charAt(0)
              ?.toUpperCase() || "P"}

          </span>

        </button>


        <button
          type="button"
          className="navbar-logout"
          onClick={handleLogout}
        >
          Sign Out
        </button>

      </div>

    </header>

  );

};


export default Navbar;