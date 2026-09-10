import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
} from "react-router-dom";

import {
  searchContent,
} from "../../services/discovery";

import {
  useProfile,
} from "../../context/ProfileContext";


const SearchOverlay = ({
  onClose,
}) => {

  const navigate = useNavigate();

  const {
    profile,
  } = useProfile();


  const inputRef = useRef(null);


  const [
    query,
    setQuery,
  ] = useState("");


  const [
    results,
    setResults,
  ] = useState({
    movies: [],
    shows: [],
  });


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  useEffect(() => {

    inputRef.current?.focus();

  }, []);


  useEffect(() => {

    const trimmed =
      query.trim();


    if (trimmed.length < 2) {

      setResults({
        movies: [],
        shows: [],
      });

      setLoading(false);
      setError("");

      return;

    }


    const timer =
      setTimeout(
        async () => {

          try {

            setLoading(true);
            setError("");


            const data =
              await searchContent(
                trimmed,
                profile?.id
              );


            setResults({
              movies:
                data?.movies || [],
              shows:
                data?.shows || [],
            });


          } catch (error) {

            console.error(
              "Search overlay error:",
              error
            );

            setError(
              "Unable to search right now."
            );


          } finally {

            setLoading(false);

          }

        },
        350
      );


    return () => {

      clearTimeout(timer);

    };

  }, [
    query,
    profile?.id,
  ]);


  const openSearchPage = () => {

    const trimmed =
      query.trim();


    if (!trimmed) {

      navigate("/search");

    } else {

      navigate(
        `/search?q=${encodeURIComponent(
          trimmed
        )}`
      );

    }


    onClose();

  };


  const openContent = (
    type,
    id
  ) => {

    const path =
      type === "movie"
        ? `/movies/${id}`
        : `/tv-shows/${id}`;


    navigate(path);

    onClose();

  };


  const movieResults =
    results.movies.slice(0, 4);


  const showResults =
    results.shows.slice(0, 4);


  const hasResults =
    movieResults.length > 0 ||
    showResults.length > 0;


  return (

    <div
      className="search-overlay"
      onClick={onClose}
    >

      <div
        className="search-overlay-panel"
        onClick={(event) =>
          event.stopPropagation()
        }
      >

        <div className="search-overlay-top">

          <div className="search-overlay-input-wrapper">

            <span className="search-overlay-icon">
              🔍
            </span>


            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(event) =>
                setQuery(
                  event.target.value
                )
              }
              placeholder="Search movies, shows, actors..."
              aria-label="Search"
            />


            {query && (

              <button
                type="button"
                className="search-overlay-clear"
                onClick={() =>
                  setQuery("")
                }
                aria-label="Clear search"
              >
                ×
              </button>

            )}

          </div>


          <button
            type="button"
            className="search-overlay-close"
            onClick={onClose}
            aria-label="Close search"
          >
            ×
          </button>

        </div>


        <div className="search-overlay-content">

          {loading && (

            <div className="search-overlay-loading">

              <div className="search-overlay-spinner"></div>

              <span>
                Searching...
              </span>

            </div>

          )}


          {!loading &&
            error && (

              <div className="search-overlay-error">
                {error}
              </div>

            )}


          {!loading &&
            !error &&
            query.trim().length >= 2 &&
            !hasResults && (

              <div className="search-overlay-empty">

                <div>
                  🔍
                </div>

                <p>
                  No results found
                </p>

                <span>
                  Try another title, actor or genre.
                </span>

              </div>

            )}


          {!loading &&
            !error &&
            hasResults && (

              <div className="search-overlay-results">

                {movieResults.length > 0 && (

                  <div className="search-overlay-group">

                    <h3>
                      Movies
                    </h3>


                    {movieResults.map(
                      (movie) => (

                        <button
                          type="button"
                          key={`movie-${movie.id}`}
                          className="search-overlay-result"
                          onClick={() =>
                            openContent(
                              "movie",
                              movie.id
                            )
                          }
                        >

                          <div className="search-overlay-result-image">

                            {movie.poster_url ? (

                              <img
                                src={
                                  movie.poster_url
                                }
                                alt={movie.title}
                              />

                            ) : (

                              <span>
                                {movie.title
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>

                            )}

                          </div>


                          <div className="search-overlay-result-info">

                            <strong>
                              {movie.title}
                            </strong>


                            <span>

                              {movie.release_year && (
                                <>
                                  {movie.release_year}
                                </>
                              )}

                              {movie.maturity_rating && (
                                <>
                                  {" • "}
                                  {movie.maturity_rating}
                                </>
                              )}

                            </span>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}


                {showResults.length > 0 && (

                  <div className="search-overlay-group">

                    <h3>
                      TV Shows
                    </h3>


                    {showResults.map(
                      (show) => (

                        <button
                          type="button"
                          key={`show-${show.id}`}
                          className="search-overlay-result"
                          onClick={() =>
                            openContent(
                              "show",
                              show.id
                            )
                          }
                        >

                          <div className="search-overlay-result-image">

                            {show.poster_url ? (

                              <img
                                src={
                                  show.poster_url
                                }
                                alt={show.title}
                              />

                            ) : (

                              <span>
                                {show.title
                                  ?.charAt(0)
                                  ?.toUpperCase()}
                              </span>

                            )}

                          </div>


                          <div className="search-overlay-result-info">

                            <strong>
                              {show.title}
                            </strong>


                            <span>

                              {show.release_year && (
                                <>
                                  {show.release_year}
                                </>
                              )}

                              {show.maturity_rating && (
                                <>
                                  {" • "}
                                  {show.maturity_rating}
                                </>
                              )}

                            </span>

                          </div>

                        </button>

                      )
                    )}

                  </div>

                )}


                <button
                  type="button"
                  className="search-overlay-view-all"
                  onClick={openSearchPage}
                >
                  View all results →
                </button>

              </div>

            )}


          {!query.trim() && (

            <div className="search-overlay-hint">

              <span>
                🔍
              </span>

              <p>
                Search for movies, shows, actors or genres
              </p>

            </div>

          )}

        </div>

      </div>

    </div>

  );

};


export default SearchOverlay;