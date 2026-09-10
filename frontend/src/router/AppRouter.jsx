import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
} from "react-router-dom";


import {
  useAuth,
} from "../context/AuthContext";


import AuthLayout
  from "../layouts/AuthLayout";


import MainLayout
  from "../layouts/MainLayout";


import Landing
  from "../pages/Landing/Landing";


import Login
  from "../pages/Login/Login";


import Signup
  from "../pages/Signup/Signup";


import Home
  from "../pages/Home/Home";


import NotFound
  from "../pages/NotFound/NotFound";


import Profiles
  from "../pages/Profiles/Profiles";


import Movies
  from "../pages/Movies/Movies";


import TVShows
  from "../pages/TVShows/TVShows";


import NewPopular
  from "../pages/NewPopular/NewPopular";


import MyList
  from "../pages/MyList/MyList";


import Search
  from "../pages/Search/Search";


import MovieDetails
  from "../pages/Details/MovieDetails";


import TVShowDetails
  from "../pages/Details/TVShowDetails";


import Watch
  from "../pages/Watch/Watch";


import History
  from "../pages/History/History";


import Subscription
  from "../pages/Subscription/Subscription";


// ============================================================
// LOADING SCREEN
// ============================================================

const LoadingScreen = () => {

  return (

    <div className="loading-screen">

      <div className="loading-spinner"></div>

      <p>
        Loading...
      </p>

    </div>

  );

};


// ============================================================
// PROTECTED ROUTE
// ============================================================

const ProtectedRoute = ({
  children,
}) => {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {

    return (
      <LoadingScreen />
    );

  }


  if (!isAuthenticated) {

    return (

      <Navigate
        to="/login"
        replace
      />

    );

  }


  return children;

};


// ============================================================
// PUBLIC ROUTE
// ============================================================

const PublicRoute = ({
  children,
}) => {

  const {
    isAuthenticated,
    loading,
  } = useAuth();


  if (loading) {

    return (
      <LoadingScreen />
    );

  }


  if (isAuthenticated) {

    return (

      <Navigate
        to="/profiles"
        replace
      />

    );

  }


  return children;

};


// ============================================================
// APP ROUTER
// ============================================================

const AppRouter = () => {

  return (

    <BrowserRouter>

      <Routes>

        {/* ================================================== */}
        {/* LANDING */}
        {/* ================================================== */}

        <Route
          path="/"
          element={
            <Landing />
          }
        />


        {/* ================================================== */}
        {/* AUTH */}
        {/* ================================================== */}

        <Route
          element={

            <PublicRoute>

              <AuthLayout />

            </PublicRoute>

          }
        >

          <Route
            path="/login"
            element={
              <Login />
            }
          />


          <Route
            path="/signup"
            element={
              <Signup />
            }
          />

        </Route>


        {/* ================================================== */}
        {/* PROTECTED APPLICATION */}
        {/* ================================================== */}

        <Route
          element={

            <ProtectedRoute>

              <MainLayout />

            </ProtectedRoute>

          }
        >

          {/* ============================================== */}
          {/* PROFILES */}
          {/* ============================================== */}

          <Route
            path="/profiles"
            element={
              <Profiles />
            }
          />


          {/* ============================================== */}
          {/* HOME */}
          {/* ============================================== */}

          <Route
            path="/home"
            element={
              <Home />
            }
          />


          {/* ============================================== */}
          {/* MOVIES */}
          {/* ============================================== */}

          <Route
            path="/movies"
            element={
              <Movies />
            }
          />


          <Route
            path="/movies/:id"
            element={
              <MovieDetails />
            }
          />


          {/* ============================================== */}
          {/* TV SHOWS */}
          {/* ============================================== */}

          <Route
            path="/tv-shows"
            element={
              <TVShows />
            }
          />


          <Route
            path="/tv-shows/:id"
            element={
              <TVShowDetails />
            }
          />


          {/* ============================================== */}
          {/* NEW & POPULAR */}
          {/* ============================================== */}

          <Route
            path="/new-popular"
            element={
              <NewPopular />
            }
          />


          {/* ============================================== */}
          {/* MY LIST */}
          {/* ============================================== */}

          <Route
            path="/my-list"
            element={
              <MyList />
            }
          />


          {/* ============================================== */}
          {/* HISTORY */}
          {/* ============================================== */}

          <Route
            path="/history"
            element={
              <History />
            }
          />


          {/* ============================================== */}
          {/* SEARCH */}
          {/* ============================================== */}

          <Route
            path="/search"
            element={
              <Search />
            }
          />


          {/* ============================================== */}
          {/* WATCH */}
          {/* ============================================== */}

          <Route
            path="/watch/:type/:id"
            element={
              <Watch />
            }
          />


          {/* ============================================== */}
          {/* SUBSCRIPTION */}
          {/* ============================================== */}

          <Route
            path="/subscription"
            element={
              <Subscription />
            }
          />


          {/* ============================================== */}
          {/* SETTINGS */}
          {/* ============================================== */}

          <Route
            path="/settings"
            element={
              <div className="page-message">

                <h2>
                  Settings
                </h2>

                <p>
                  Settings coming soon.
                </p>

              </div>
            }
          />

        </Route>


        {/* ================================================== */}
        {/* 404 */}
        {/* ================================================== */}

        <Route
          path="*"
          element={
            <NotFound />
          }
        />

      </Routes>

    </BrowserRouter>

  );

};


export default AppRouter;