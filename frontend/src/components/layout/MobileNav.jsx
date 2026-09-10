import {
  NavLink,
} from "react-router-dom";


const MobileNav = () => {

  const getNavClass = ({
    isActive,
  }) => {

    return `mobile-nav-item ${
      isActive
        ? "mobile-nav-item-active"
        : ""
    }`;

  };


  return (

    <nav className="mobile-navigation">

      <NavLink
        to="/home"
        className={getNavClass}
      >

        <span className="mobile-nav-icon">
          ⌂
        </span>

        <span>
          Home
        </span>

      </NavLink>


      <NavLink
        to="/tv-shows"
        className={getNavClass}
      >

        <span className="mobile-nav-icon">
          ▣
        </span>

        <span>
          TV Shows
        </span>

      </NavLink>


      <NavLink
        to="/movies"
        className={getNavClass}
      >

        <span className="mobile-nav-icon">
          ▶
        </span>

        <span>
          Movies
        </span>

      </NavLink>


      <NavLink
        to="/new-popular"
        className={getNavClass}
      >

        <span className="mobile-nav-icon">
          ★
        </span>

        <span>
          New
        </span>

      </NavLink>


      <NavLink
        to="/my-list"
        className={getNavClass}
      >

        <span className="mobile-nav-icon">
          +
        </span>

        <span>
          My List
        </span>

      </NavLink>

    </nav>

  );

};


export default MobileNav;