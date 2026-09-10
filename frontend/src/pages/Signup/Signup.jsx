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


const Signup = () => {

  const navigate =
    useNavigate();

  const {
    register,
  } = useAuth();


  const [formData, setFormData] =
    useState({
      email: "",
      password: "",
      password2: "",
    });


  const [showPassword, setShowPassword] =
    useState(false);


  const [showConfirmPassword, setShowConfirmPassword] =
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
  // PASSWORD VALIDATION
  // ==========================================================

  const validateForm = () => {

    if (
      formData.password.length < 8
    ) {

      return (
        "Password must be at least 8 characters long."
      );

    }


    if (
      formData.password !==
      formData.password2
    ) {

      return (
        "Passwords do not match."
      );

    }


    return null;

  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();

    setError("");


    const validationError =
      validateForm();


    if (validationError) {

      setError(
        validationError
      );

      return;

    }


    setLoading(true);


    try {

      // ======================================================
      // BACKEND REGISTRATION PAYLOAD
      // ======================================================
      // Frontend uses password2.
      // Backend expects password_confirm.
      // ======================================================

      const registrationData = {

        email:
          formData.email.trim(),

        password:
          formData.password,

        password_confirm:
          formData.password2,

      };


      await register(
        registrationData
      );


      // ======================================================
      // REGISTRATION SUCCESS
      // ======================================================

      navigate(
        "/login",
        {
          replace: true,

          state: {
            registered: true,
          },
        }
      );


    } catch (error) {

      const responseData =
        error.response?.data;


      let message =
        "Unable to create your account.";


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
        responseData &&
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
      {/* SIGNUP CARD */}
      {/* ==================================================== */}

      <section
        className="auth-card auth-card-signup"
        aria-label="Create account"
      >

        <div className="auth-card-header">

          <h1>
            Create Account
          </h1>

          <p>
            Start watching your favorite content.
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
              htmlFor="signup-email"
            >
              Email
            </label>

            <input
              id="signup-email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
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
              htmlFor="signup-password"
            >
              Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="signup-password"
                name="password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={formData.password}
                onChange={handleChange}
                placeholder="Password"
                autoComplete="new-password"
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
              >

                {showPassword
                  ? "Hide"
                  : "Show"
                }

              </button>

            </div>

          </div>


          {/* ================================================ */}
          {/* CONFIRM PASSWORD */}
          {/* ================================================ */}

          <div className="auth-field">

            <label
              htmlFor="signup-password2"
            >
              Confirm Password
            </label>

            <div className="password-input-wrapper">

              <input
                id="signup-password2"
                name="password2"
                type={
                  showConfirmPassword
                    ? "text"
                    : "password"
                }
                value={formData.password2}
                onChange={handleChange}
                placeholder="Confirm password"
                autoComplete="new-password"
                required
                disabled={loading}
              />


              <button
                type="button"
                className="password-toggle"
                onClick={() =>
                  setShowConfirmPassword(
                    previous =>
                      !previous
                  )
                }
                disabled={loading}
              >

                {showConfirmPassword
                  ? "Hide"
                  : "Show"
                }

              </button>

            </div>

          </div>


          {/* ================================================ */}
          {/* CREATE ACCOUNT */}
          {/* ================================================ */}

          <button
            type="submit"
            className="auth-submit-button"
            disabled={loading}
          >

            {loading ? (

              <span className="button-loading">

                <span className="button-spinner"></span>

                Creating account...

              </span>

            ) : (

              "Create Account"

            )}

          </button>

        </form>


        {/* ================================================== */}
        {/* LOGIN */}
        {/* ================================================== */}

        <div className="auth-signup">

          <span>
            Already have an account?
          </span>

          <Link to="/login">
            Sign in now.
          </Link>

        </div>


        {/* ================================================== */}
        {/* TERMS */}
        {/* ================================================== */}

        <p className="auth-security-text">

          By continuing, you agree to our
          Terms of Use and Privacy Policy.

        </p>

      </section>

    </main>

  );

};


export default Signup;