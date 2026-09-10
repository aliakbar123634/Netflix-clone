import {
  useState,
} from "react";

import {
  Link,
  useNavigate,
} from "react-router-dom";

import {
  useAuth,
} from "../../context/AuthContext";


const Login = () => {

  const navigate =
    useNavigate();

  const {
    login,
  } = useAuth();


  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
    });


  const [showPassword, setShowPassword] =
    useState(false);


  const [error, setError] =
    useState("");


  const [loading, setLoading] =
    useState(false);


  // ==========================================================
  // HANDLE INPUT
  // ==========================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
    } = event.target;


    setFormData(
      previous => ({
        ...previous,
        [name]: value,
      })
    );


    if (error) {

      setError("");

    }

  };


  // ==========================================================
  // HANDLE LOGIN
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");

    setLoading(true);


    try {

      await login(
        formData
      );


      navigate(
        "/home",
        {
          replace: true,
        }
      );


    } catch (error) {

      const responseData =
        error.response?.data;


      let message =
        "Unable to sign in. Please check your email and password.";


      if (
        responseData?.detail
      ) {

        message =
          responseData.detail;

      } else if (
        responseData?.message
      ) {

        message =
          responseData.message;

      } else if (
        responseData
        &&
        typeof responseData === "object"
      ) {

        const messages =
          Object.values(
            responseData
          )
          .flat()
          .filter(Boolean);


        if (messages.length) {

          message =
            messages.join(" ");

        }

      }


      setError(
        message
      );


    } finally {

      setLoading(false);

    }

  };


  return (

    <main className="auth-page">

      {/* ==================================================== */}
      {/* BACKGROUND */}
      {/* ==================================================== */}

      <div
        className="auth-background"
        aria-hidden="true"
      >

        <div className="auth-background-gradient"></div>

        <div className="auth-background-glow"></div>

      </div>


      {/* ==================================================== */}
      {/* LOGIN CARD */}
      {/* ==================================================== */}

      <section
        className="auth-card"
        aria-label="Sign in"
      >

        <div className="auth-card-header">

          <h1>
            Sign In
          </h1>

          <p>
            Welcome back.
          </p>

        </div>


        {/* ================================================== */}
        {/* ERROR */}
        {/* ================================================== */}

        {error && (

          <div
            className="auth-error"
            role="alert"
          >

            <span className="auth-error-icon">
              !
            </span>

            <span>
              {error}
            </span>

          </div>

        )}


        {/* ================================================== */}
        {/* FORM */}
        {/* ================================================== */}

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >

          {/* ================================================ */}
          {/* EMAIL */}
          {/* ================================================ */}

          <div className="auth-field">

            <label
              htmlFor="login-email"
            >
              Email
            </label>

            <input
              id="login-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email or phone number"
              autoComplete="email"
              required
              disabled={loading}
            />

          </div>


          {/* ================================================ */}
          {/* PASSWORD */}
          {/* ================================================ */}

          <div className="auth-field">

            <label
              htmlFor="login-password"
            >
              Password
            </label>


            <div className="password-input-wrapper">

              <input
                id="login-password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="current-password"
                required
                disabled={loading}
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowPassword(
                    previous =>
                      !previous
                  )
                }
                disabled={loading}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
              >

                {showPassword
                  ? "Hide"
                  : "Show"
                }

              </button>

            </div>

          </div>


          {/* ================================================ */}
          {/* SIGN IN */}
          {/* ================================================ */}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >

            {loading ? (

              <span className="button-loading">

                <span className="button-spinner"></span>

                Signing in...

              </span>

            ) : (

              "Sign In"

            )}

          </button>


          {/* ================================================ */}
          {/* OPTIONS */}
          {/* ================================================ */}

          <div className="auth-options">

            <label className="remember-me">

              <input
                type="checkbox"
                defaultChecked
              />

              <span>
                Remember me
              </span>

            </label>


            <button
              type="button"
              className="help-button"
              onClick={() => {
                setError(
                  "Password recovery will be connected in a later phase."
                );
              }}
            >
              Need help?
            </button>

          </div>

        </form>


        {/* ================================================== */}
        {/* SIGNUP */}
        {/* ================================================== */}

        <div className="auth-signup">

          <span>
            New to StreamFlix?
          </span>

          <Link to="/signup">
            Sign up now.
          </Link>

        </div>


        {/* ================================================== */}
        {/* SECURITY TEXT */}
        {/* ================================================== */}

        <p className="auth-security-text">

          This page is protected by secure authentication.

        </p>

      </section>

    </main>

  );

};


export default Login;