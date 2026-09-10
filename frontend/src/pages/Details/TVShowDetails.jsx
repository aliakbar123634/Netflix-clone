import {
  useEffect,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getTVShow,
  getSimilarTVShowContent,
} from "../../services/catalog";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  addToMyList,
} from "../../services/watchlist";

import SimilarContent
  from "../../components/catalog/SimilarContent";


const TVShowDetails = () => {

  const {
    id,
  } = useParams();


  const navigate =
    useNavigate();


  const {
    profile,
  } = useProfile();


  const [
    show,
    setShow,
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
  // LOAD SHOW
  // ==========================================================

  useEffect(() => {

    const loadShow =
      async () => {

        if (!profile?.id) {

          setLoading(false);

          return;

        }


        try {

          setLoading(true);
          setError("");


          const data =
            await getTVShow(
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


          setShow(
            data
          );


        } catch (error) {

          console.error(
            "TV show details error:",
            error
          );


          setError(
            "TV show not found."
          );


        } finally {

          setLoading(false);

        }

      };


    loadShow();

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
            await getSimilarTVShowContent(
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
        !show?.id ||
        adding
      ) {

        return;

      }


      try {

        setAdding(true);


        await addToMyList(
          profile.id,
          "show",
          show.id
        );


      } catch (error) {

        console.error(
          "Add show to My List error:",
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
          Loading TV show...
        </p>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error || !show) {

    return (

      <div className="page-message">

        <h2>
          {error || "TV show not found."}
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
    show.backdrop_url ||
    show.backdrop;


  const poster =
    show.poster_url ||
    show.poster;


  const seasons =
    Array.isArray(
      show.seasons
    )
      ? show.seasons
      : [];


  const totalEpisodes =
    seasons.reduce(
      (total, season) =>
        total +
        (
          Array.isArray(
            season.episodes
          )
            ? season.episodes.length
            : 0
        ),
      0
    );


  const firstEpisode =
    seasons?.[0]?.episodes?.[0];


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
            TV SHOW
          </div>


          <h1>
            {show.title}
          </h1>


          <div className="details-meta">

            {show.release_year && (
              <span>
                {show.release_year}
              </span>
            )}


            {show.maturity_rating && (
              <span>
                {show.maturity_rating}
              </span>
            )}


            <span>
              {seasons.length}{" "}
              {seasons.length === 1
                ? "Season"
                : "Seasons"
              }
            </span>


            <span>
              {totalEpisodes}{" "}
              {totalEpisodes === 1
                ? "Episode"
                : "Episodes"
              }
            </span>


            {show.language && (
              <span>
                {show.language.toUpperCase()}
              </span>
            )}

          </div>


          {show.description && (

            <p className="details-description">
              {show.description}
            </p>

          )}


          <div className="details-actions">

            {firstEpisode && (

              <button
                type="button"
                className="details-play-button"
                onClick={() =>
                  navigate(
                    `/watch/episode/${firstEpisode.id}`
                  )
                }
              >
                ▶ Play
              </button>

            )}


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
                alt={show.title}
                className="details-poster"
              />

            </div>

          )}


          <div className="details-info-content">

            <div>

              <h2>
                About {show.title}
              </h2>

              <p>
                {show.description}
              </p>

            </div>


            {show.genres?.length > 0 && (

              <div className="details-section-block">

                <h3>
                  Genres
                </h3>

                <div className="details-tags">

                  {show.genres.map(
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


            {show.directors?.length > 0 && (

              <div className="details-section-block">

                <h3>
                  Directors
                </h3>

                <div className="details-people">

                  {show.directors.map(
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


        {show.cast?.length > 0 && (

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

              {show.cast.map(
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


        {/* ================================================== */}
        {/* EPISODES */}
        {/* ================================================== */}

        <div className="episodes-section">

          <div className="details-section-heading">

            <span>
              SERIES
            </span>

            <h2>
              Episodes
            </h2>

          </div>


          {!seasons.length && (

            <div className="page-message">

              <p>
                No episodes available yet.
              </p>

            </div>

          )}


          {seasons.map(
            (season) => (

              <div
                key={season.id}
                className="season-block"
              >

                <div className="season-header">

                  <div>

                    <h3>
                      {season.title ||
                        `Season ${season.season_number}`
                      }
                    </h3>


                    {season.description && (

                      <p>
                        {season.description}
                      </p>

                    )}

                  </div>


                  <span>

                    {season.episodes?.length || 0}{" "}

                    {season.episodes?.length === 1
                      ? "Episode"
                      : "Episodes"
                    }

                  </span>

                </div>


                <div className="episode-list">

                  {season.episodes?.map(
                    (episode) => (

                      <article
                        key={episode.id}
                        className="episode-card"
                        onClick={() =>
                          navigate(
                            `/watch/episode/${episode.id}`
                          )
                        }
                      >

                        <div className="episode-thumbnail">

                          {episode.thumbnail_url ? (

                            <img
                              src={
                                episode.thumbnail_url
                              }
                              alt={
                                episode.title
                              }
                              loading="lazy"
                            />

                          ) : (

                            <div className="episode-thumbnail-fallback">
                              ▶
                            </div>

                          )}


                          <div className="episode-play-icon">
                            ▶
                          </div>

                        </div>


                        <div className="episode-info">

                          <span className="episode-number">
                            Episode{" "}
                            {episode.episode_number}
                          </span>


                          <h4>
                            {episode.title}
                          </h4>


                          {episode.description && (

                            <p>
                              {episode.description}
                            </p>

                          )}


                          <div className="episode-meta">

                            {episode.duration && (

                              <span>
                                {episode.duration} min
                              </span>

                            )}


                            {episode.release_date && (

                              <span>
                                {episode.release_date}
                              </span>

                            )}

                          </div>

                        </div>

                      </article>

                    )
                  )}

                </div>

              </div>

            )
          )}

        </div>

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


export default TVShowDetails;