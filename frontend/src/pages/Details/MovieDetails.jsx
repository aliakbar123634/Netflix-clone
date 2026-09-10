import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getMovie,
  getSimilarMovieContent,
} from "../../services/catalog";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  addToMyList,
} from "../../services/watchlist";

import SimilarContent
  from "../../components/catalog/SimilarContent";


const MovieDetails = () => {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const {
    profile,
  } = useProfile();


  const [
    movie,
    setMovie,
  ] = useState(null);


  const [
    similar,
    setSimilar,
  ] = useState({
    movies: [],
    shows: [],
  });


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    similarLoading,
    setSimilarLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    similarError,
    setSimilarError,
  ] = useState("");


  const [
    adding,
    setAdding,
  ] = useState(false);


  // ==========================================================
  // LOAD MOVIE
  // ==========================================================

  useEffect(() => {

    const loadMovie =
      async () => {

        if (!profile?.id) {

          setLoading(false);

          return;

        }


        try {

          setLoading(true);
          setError("");


          const data =
            await getMovie(
              id
            );


          // --------------------------------------------------
          // KIDS PROTECTION
          // --------------------------------------------------

          if (
            profile.is_kids &&
            ![
              "all",
              "7+",
            ].includes(
              data?.maturity_rating
            )
          ) {

            navigate(
              "/home",
              {
                replace: true,
              }
            );

            return;

          }


          setMovie(
            data
          );


        } catch (error) {

          console.error(
            "Movie details error:",
            error
          );


          setError(
            "Movie not found."
          );


        } finally {

          setLoading(false);

        }

      };


    loadMovie();

  }, [
    id,
    profile?.id,
    profile?.is_kids,
    navigate,
  ]);


  // ==========================================================
  // SIMILAR
  // ==========================================================

  useEffect(() => {

    const loadSimilar =
      async () => {

        try {

          setSimilarLoading(true);
          setSimilarError("");


          const data =
            await getSimilarMovieContent(
              id,
              profile?.id
            );


          setSimilar({

            movies:
              Array.isArray(
                data?.movies
              )
                ? data.movies
                : [],

            shows:
              Array.isArray(
                data?.shows
              )
                ? data.shows
                : [],

          });


        } catch (error) {

          console.error(
            "Similar content error:",
            error
          );


          setSimilarError(
            "Unable to load similar content."
          );


        } finally {

          setSimilarLoading(false);

        }

      };


    if (
      id &&
      profile?.id
    ) {

      loadSimilar();

    }

  }, [
    id,
    profile?.id,
  ]);


  // ==========================================================
  // ADD TO MY LIST
  // ==========================================================

  const handleAdd =
    async () => {

      if (
        !profile?.id ||
        !movie?.id ||
        adding
      ) {

        return;

      }


      try {

        setAdding(true);


        await addToMyList(
          profile.id,
          "movie",
          movie.id
        );


      } catch (error) {

        console.error(
          "Add movie to My List error:",
          error
        );


      } finally {

        setAdding(false);

      }

    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="page-loading">

        <div className="page-spinner"></div>

        <p>
          Loading movie...
        </p>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !movie) {

    return (

      <div className="page-message">

        <h2>
          {error || "Movie not found."}
        </h2>

        <button
          type="button"
          onClick={() => navigate(-1)}
        >
          Go Back
        </button>

      </div>

    );

  }


  const backdrop =
    movie.backdrop_url ||
    movie.backdrop;


  const poster =
    movie.poster_url ||
    movie.poster;


  return (

    <div
      className={
        profile?.is_kids
          ? "details-page kids-details-page"
          : "details-page"
      }
    >

      <section
        className="details-hero"
        style={
          backdrop
            ? {
                backgroundImage:
                  `linear-gradient(
                    90deg,
                    rgba(0,0,0,.96) 0%,
                    rgba(0,0,0,.78) 42%,
                    rgba(0,0,0,.30) 100%
                  ),
                  linear-gradient(
                    0deg,
                    #090909 0%,
                    transparent 45%
                  ),
                  url("${backdrop}")`,
              }
            : undefined
        }
      >

        <div className="details-content">

          <div className="details-type-badge">
            MOVIE
          </div>


          <h1>
            {movie.title}
          </h1>


          <div className="details-meta">

            {movie.release_year && (
              <span>
                {movie.release_year}
              </span>
            )}


            {movie.maturity_rating && (
              <span>
                {movie.maturity_rating}
              </span>
            )}


            {movie.duration && (
              <span>
                {movie.duration} min
              </span>
            )}


            {movie.language && (
              <span>
                {movie.language.toUpperCase()}
              </span>
            )}

          </div>


          {movie.description && (

            <p className="details-description">
              {movie.description}
            </p>

          )}


          <div className="details-actions">

            <button
              type="button"
              className="details-play-button"
              onClick={() =>
                navigate(
                  `/watch/movie/${movie.id}`
                )
              }
            >
              ▶ Play
            </button>


            <button
              type="button"
              className="details-list-button"
              onClick={handleAdd}
              disabled={
                adding ||
                !profile?.id
              }
            >
              {adding
                ? "Adding..."
                : "+ My List"
              }
            </button>

          </div>

        </div>

      </section>


      <section className="details-body">

        <div className="details-main-info">

          {poster && (

            <div className="details-poster-wrapper">

              <img
                src={poster}
                alt={movie.title}
                className="details-poster"
              />

            </div>

          )}


          <div className="details-info-content">

            <div>

              <h2>
                About {movie.title}
              </h2>

              <p>
                {movie.description}
              </p>

            </div>


            {movie.genres?.length > 0 && (

              <div className="details-section-block">

                <h3>
                  Genres
                </h3>

                <div className="details-tags">

                  {movie.genres.map(
                    (genre) => (

                      <span
                        key={genre.id}
                      >
                        {genre.name}
                      </span>

                    )
                  )}

                </div>

              </div>

            )}


            {movie.directors?.length > 0 && (

              <div className="details-section-block">

                <h3>
                  Directors
                </h3>

                <div className="details-people">

                  {movie.directors.map(
                    (person) => (

                      <div
                        key={person.id}
                        className="details-person"
                      >

                        {person.photo_url && (

                          <img
                            src={
                              person.photo_url
                            }
                            alt={
                              person.name
                            }
                          />

                        )}

                        <span>
                          {person.name}
                        </span>

                      </div>

                    )
                  )}

                </div>

              </div>

            )}

          </div>

        </div>


        {movie.cast?.length > 0 && (

          <div className="details-cast-section">

            <div className="details-section-heading">

              <span>
                CAST
              </span>

              <h2>
                Cast
              </h2>

            </div>


            <div className="details-cast-grid">

              {movie.cast.map(
                (person) => (

                  <article
                    key={person.id}
                    className="details-cast-card"
                  >

                    <div className="details-cast-image">

                      {person.photo_url ? (

                        <img
                          src={person.photo_url}
                          alt={person.name}
                        />

                      ) : (

                        <span>
                          {person.name
                            ?.charAt(0)
                            ?.toUpperCase()}
                        </span>

                      )}

                    </div>


                    <div>

                      <h3>
                        {person.name}
                      </h3>

                      {person.bio && (

                        <p>
                          {person.bio}
                        </p>

                      )}

                    </div>

                  </article>

                )
              )}

            </div>

          </div>

        )}

      </section>


      {!similarLoading &&
        !similarError && (

          <SimilarContent
            movies={
              similar.movies
            }
            shows={
              similar.shows
            }
            profileId={
              profile?.id
            }
          />

        )}

    </div>

  );

};


export default MovieDetails;