import { NavLink } from "react-router-dom";


const DesktopNav = () => {

  const getNavClass = ({
    isActive,
  }) => {

    return `nav-link ${
      isActive
        ? "nav-link-active"
        : ""
    }`;

  };


  return (

    <nav className="desktop-navigation">

      <NavLink
        to="/home"
        className={getNavClass}
      >
        Home
      </NavLink>


      <NavLink
        to="/tv-shows"
        className={getNavClass}
      >
        TV Shows
      </NavLink>


      <NavLink
        to="/movies"
        className={getNavClass}
      >
        Movies
      </NavLink>


      <NavLink
        to="/new-popular"
        className={getNavClass}
      >
        New & Popular
      </NavLink>


      <NavLink
        to="/my-list"
        className={getNavClass}
      >
        My List
      </NavLink>

    </nav>

  );

};


export default DesktopNav;