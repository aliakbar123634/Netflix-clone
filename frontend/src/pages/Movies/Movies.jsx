import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  getMovies,
} from "../../services/catalog";

import {
  getMyList,
} from "../../services/watchlist";

import ContentCard
  from "../../components/catalog/ContentCard";


const Movies = () => {

  const {
    profile,
  } = useProfile();


  const [movies, setMovies] =
    useState([]);


  const [myList, setMyList] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const loadMovies = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");


        const movieResponse =
          await getMovies();


        const movieList =
          Array.isArray(movieResponse)
            ? movieResponse
            : movieResponse?.results || [];


        setMovies(
          movieList
        );


        if (profile?.id) {

          const listResponse =
            await getMyList(
              profile.id
            );


          const list =
            Array.isArray(listResponse)
              ? listResponse
              : listResponse?.results || [];


          setMyList(list);

        }

      } catch (error) {

        console.error(
          "Movies error:",
          error
        );


        setError(
          "Unable to load movies."
        );

      } finally {

        setLoading(false);

      }

    },
    [profile?.id]
  );


  useEffect(() => {

    loadMovies();

  }, [loadMovies]);


  const getMyListItemId = (
    movie
  ) => {

    const found =
      myList.find(
        (item) => {

          const contentId =
            item?.content_id ??
            item?.object_id ??
            item?.content?.id;


          const contentType =
            item?.content_type_display ??
            item?.content_type;


          return (
            Number(contentId) ===
              Number(movie.id) &&
            (
              !contentType ||
              contentType === "movie"
            )
          );

        }
      );


    return found?.id || null;

  };


  if (loading) {

    return (

      <div className="page-loading">

        <div className="page-spinner"></div>

        <p>
          Loading movies...
        </p>

      </div>

    );

  }


  return (

    <div className="catalog-page">

      <div className="catalog-page-header">

        <span>
          STREAMFLIX
        </span>

        <h1>
          Movies
        </h1>

        <p>
          Discover movies you may love.
        </p>

      </div>


      {error && (

        <div className="catalog-error">
          {error}
        </div>

      )}


      {!movies.length && !error && (

        <div className="page-message">

          <h2>
            No movies available
          </h2>

          <p>
            Movies will appear here once they are published.
          </p>

        </div>

      )}


      {movies.length > 0 && (

        <div className="catalog-grid">

          {movies.map(
            (movie) => (

              <ContentCard
                key={movie.id}
                item={movie}
                type="movie"
                profileId={
                  profile?.id
                }
                myListItemId={
                  getMyListItemId(
                    movie
                  )
                }
                onListChange={
                  loadMovies
                }
              />

            )
          )}

        </div>

      )}

    </div>

  );

};


export default Movies;