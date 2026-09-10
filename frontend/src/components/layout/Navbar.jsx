import {
  useEffect,
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import Logo from "../common/Logo";

import IconButton from "../common/IconButton";

import DesktopNav from "./DesktopNav";

import MobileNav from "./MobileNav";

import AccountMenu from "./AccountMenu";

import SearchOverlay from "../search/SearchOverlay";


const Navbar = () => {

  const [
    isScrolled,
    setIsScrolled,
  ] = useState(false);


  const [
    searchOpen,
    setSearchOpen,
  ] = useState(false);


  const navigate =
    useNavigate();


  useEffect(() => {

    const handleScroll = () => {

      if (
        window.scrollY > 20
      ) {

        setIsScrolled(true);

      } else {

        setIsScrolled(false);

      }

    };


    window.addEventListener(
      "scroll",
      handleScroll
    );


    handleScroll();


    return () => {

      window.removeEventListener(
        "scroll",
        handleScroll
      );

    };

  }, []);


  useEffect(() => {

    if (!searchOpen) {
      return;
    }


    const handleEscape = (
      event
    ) => {

      if (
        event.key === "Escape"
      ) {

        setSearchOpen(false);

      }

    };


    document.addEventListener(
      "keydown",
      handleEscape
    );


    document.body.style.overflow =
      "hidden";


    return () => {

      document.removeEventListener(
        "keydown",
        handleEscape
      );

      document.body.style.overflow =
        "";

    };

  }, [
    searchOpen,
  ]);


  const handleSearch = () => {

    setSearchOpen(true);

  };


  const handleSearchClose = () => {

    setSearchOpen(false);

  };


  return (

    <>

      <header
        className={`main-navbar ${
          isScrolled
            ? "main-navbar-scrolled"
            : ""
        }`}
      >

        <div className="navbar-container">

          <div className="navbar-left">

            <Logo />

            <DesktopNav />

          </div>


          <div className="navbar-right">

            <IconButton
              label="Search"
              className="search-button"
              onClick={handleSearch}
            >

              <svg
                width="22"
                height="22"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                aria-hidden="true"
              >

                <circle
                  cx="11"
                  cy="11"
                  r="7"
                  stroke="currentColor"
                  strokeWidth="2"
                />

                <path
                  d="M16.5 16.5L21 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                />

              </svg>

            </IconButton>


            <Link
              to="/profiles"
              className="kids-link"
            >
              Kids
            </Link>


            <AccountMenu />

          </div>

        </div>

      </header>


      <MobileNav />


      {searchOpen && (

        <SearchOverlay
          onClose={
            handleSearchClose
          }
        />

      )}

    </>

  );

};


export default Navbar;