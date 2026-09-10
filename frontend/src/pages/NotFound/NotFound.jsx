import {
  Link,
} from "react-router-dom";


const NotFound = () => {

  return (

    <main className="not-found-page">

      <div>

        <h1>
          404
        </h1>

        <h2>
          Page not found
        </h2>

        <p>
          The page you are looking for
          doesn't exist.
        </p>

        <Link
          to="/"
          className="primary-button"
        >
          Go Home
        </Link>

      </div>

    </main>

  );
};


export default NotFound;