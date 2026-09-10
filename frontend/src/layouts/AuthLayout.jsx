import {
  Outlet,
} from "react-router-dom";

import Logo from "../components/common/Logo";


const AuthLayout = () => {

  return (

    <div className="auth-layout">

      <header className="auth-topbar">

        <Logo />

        <div className="auth-topbar-right">

          <span className="auth-topbar-text">
            Stream anywhere
          </span>

        </div>

      </header>


      <Outlet />

    </div>

  );

};


export default AuthLayout;