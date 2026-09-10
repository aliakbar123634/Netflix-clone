import { Link } from "react-router-dom";

import { APP_NAME } from "../../utils/constants";


const Logo = () => {

  return (

    <Link
      to="/home"
      className="brand-logo"
      aria-label={`${APP_NAME} Home`}
    >

      {APP_NAME}

    </Link>

  );

};


export default Logo;