import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useSearchParams,
} from "react-router-dom";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  searchContent,
} from "../../services/discovery";

import {
  getGenresList,
} from "../../services/catalog";

import ContentCard
  from "../../components/catalog/ContentCard";


const Search = () => {

  const {
    profile,
  } = useProfile();


  const [
    searchParams,
    setSearchParams,
  ] = useSearchParams();


  const [
    query,
    setQuery,
  ] = useState(
    searchParams.get("q") || ""
  );


  const [
    results,
    setResults,
  ] = useState({
    movies: [],
    shows: [],
    total: 0,
  });


  const [
    genres,
    setGenres,
  ] = useState([]);


  const [
    type,
    setType,
  ] = useState(
    searchParams.get("type") || "all"
  );


  const [
    genre,
    setGenre,
  ] = useState(
    searchParams.get("genre") || ""
  );


  const [
    year,
    setYear,
  ] = useState(
    searchParams.get("year") || ""
  );


  const [
    sort,
    setSort,
  ] = useState(
    searchParams.get("sort") || "relevance"
  );


  const [
    loading,
    setLoading,
  ] = useState(false);


  const [
    genresLoading,
    setGenresLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // LOAD GENRES
  // ==========================================================

  useEffect(() => {

    const loadGenres =
      async () => {

        try {

          setGenresLoading(true);


          const data =
            await getGenresList();


          setGenres(
            data || []
          );


        } catch (error) {

          console.error(
            "Genre loading error:",
            error
          );


        } finally {

          setGenresLoading(false);

        }

      };


    loadGenres();

  }, []);


  // ==========================================================
  // SEARCH + FILTERS
  // ==========================================================

  useEffect(() => {

    const trimmed =
      query.trim();

    const hasQuery =
      trimmed.length >= 2;

    const hasActiveFilters =
      type !== "all" ||
      genre !== "" ||
      year !== "" ||
      sort !== "relevance";


    // Do not call the API when there is no
    // search query and no active filter.
    if (!hasQuery && !hasActiveFilters) {

      setResults({
        movies: [],
        shows: [],
        total: 0,
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
                profile?.id,
                {
                  type,
                  genre,
                  year,
                  sort,
                }
              );


            setResults({

              movies:
                data?.movies || [],

              shows:
                data?.shows || [],

              total:
                data?.total || 0,

            });


          } catch (error) {

            console.error(
              "Search error:",
              error
            );


            setError(
              "Unable to search right now. Please try again."
            );


            setResults({
              movies: [],
              shows: [],
              total: 0,
            });


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
    type,
    genre,
    year,
    sort,
  ]);


  // ==========================================================
  // URL SYNC
  // ==========================================================

  useEffect(() => {

    const params = {};


    if (query.trim()) {

      params.q =
        query.trim();

    }


    if (type !== "all") {

      params.type =
        type;

    }


    if (genre) {

      params.genre =
        genre;

    }


    if (year) {

      params.year =
        year;

    }


    if (sort !== "relevance") {

      params.sort =
        sort;

    }


    setSearchParams(
      params,
      {
        replace: true,
      }
    );

  }, [
    query,
    type,
    genre,
    year,
    sort,
    setSearchParams,
  ]);


  // ==========================================================
  // RESET FILTERS
  // ==========================================================

  const resetFilters = () => {

    setType("all");
    setGenre("");
    setYear("");
    setSort("relevance");

  };


  // ==========================================================
  // AVAILABLE YEARS
  // ==========================================================

  const years =
    useMemo(() => {

      const currentYear =
        new Date().getFullYear();


      const yearList = [];


      for (
        let value = currentYear;
        value >= 1990;
        value--
      ) {

        yearList.push(value);

      }


      return yearList;

    }, []);


  const hasActiveFilters =
    type !== "all" ||
    genre !== "" ||
    year !== "" ||
    sort !== "relevance";


  const hasQuery =
    query.trim().length >= 2;


  const hasSearchCriteria =
    hasQuery ||
    hasActiveFilters;


  return (

    <div className="search-page">

      {/* ==================================================== */}
      {/* HEADER */}
      {/* ==================================================== */}

      <div className="search-header">

        <span>
          STREAMFLIX
        </span>


        <h1>
          Search
        </h1>


        <p className="search-subtitle">
          Find movies, shows, actors and genres.
        </p>


        <div className="search-main-input">

          <span>
            🔍
          </span>


          <input
            type="search"
            value={query}
            onChange={(event) =>
              setQuery(
                event.target.value
              )
            }
            placeholder="Search movies, shows, actors..."
            autoComplete="off"
          />


          {query && (

            <button
              type="button"
              onClick={() =>
                setQuery("")
              }
              aria-label="Clear search"
            >
              ×
            </button>

          )}

        </div>

      </div>


      {/* ==================================================== */}
      {/* FILTERS */}
      {/* ==================================================== */}

      <div className="search-filters">

        <div className="search-filter-group">

          <label>
            Type
          </label>


          <select
            value={type}
            onChange={(event) =>
              setType(
                event.target.value
              )
            }
          >

            <option value="all">
              All
            </option>

            <option value="movie">
              Movies
            </option>

            <option value="show">
              TV Shows
            </option>

          </select>

        </div>


        <div className="search-filter-group">

          <label>
            Genre
          </label>


          <select
            value={genre}
            onChange={(event) =>
              setGenre(
                event.target.value
              )
            }
            disabled={
              genresLoading
            }
          >

            <option value="">
              All Genres
            </option>


            {genres.map(
              (item) => (

                <option
                  key={item.id}
                  value={item.slug}
                >
                  {item.name}
                </option>

              )
            )}

          </select>

        </div>


        <div className="search-filter-group">

          <label>
            Year
          </label>


          <select
            value={year}
            onChange={(event) =>
              setYear(
                event.target.value
              )
            }
          >

            <option value="">
              All Years
            </option>


            {years.map(
              (item) => (

                <option
                  key={item}
                  value={item}
                >
                  {item}
                </option>

              )
            )}

          </select>

        </div>


        <div className="search-filter-group">

          <label>
            Sort
          </label>


          <select
            value={sort}
            onChange={(event) =>
              setSort(
                event.target.value
              )
            }
          >

            <option value="relevance">
              Relevance
            </option>

            <option value="popular">
              Most Popular
            </option>

            <option value="newest">
              Newest
            </option>

            <option value="oldest">
              Oldest
            </option>

          </select>

        </div>


        {hasActiveFilters && (

          <button
            type="button"
            className="search-reset-button"
            onClick={resetFilters}
          >
            Reset
          </button>

        )}

      </div>


      {/* ==================================================== */}
      {/* RESULTS */}
      {/* ==================================================== */}

      <div className="search-results-area">

        {loading && (

          <div className="page-loading">

            <div className="page-spinner"></div>

            <p>
              Searching...
            </p>

          </div>

        )}


        {!loading &&
          error && (

            <div className="catalog-error">
              {error}
            </div>

          )}


        {!loading &&
          !error &&
          !hasSearchCriteria && (

            <div className="search-empty-state">

              <div className="search-empty-icon">
                🔍
              </div>

              <h2>
                What are you watching?
              </h2>

              <p>
                Start typing to search StreamFlix.
              </p>

            </div>

          )}


        {!loading &&
          !error &&
          hasSearchCriteria &&
          results.total === 0 && (

            <div className="search-empty-state">

              <div className="search-empty-icon">
                😕
              </div>

              <h2>
                No results found
              </h2>

              <p>
                Try a different title, actor,
                genre or year.
              </p>

            </div>

          )}


        {!loading &&
          !error &&
          results.movies.length > 0 && (

            <section className="search-section">

              <div className="search-section-heading">

                <div>

                  <span>
                    RESULTS
                  </span>

                  <h2>
                    Movies
                  </h2>

                </div>


                <strong>
                  {results.movies.length}
                </strong>

              </div>


              <div className="catalog-grid">

                {results.movies.map(
                  (movie) => (

                    <ContentCard
                      key={
                        `movie-${movie.id}`
                      }
                      item={movie}
                      type="movie"
                      profileId={
                        profile?.id
                      }
                    />

                  )
                )}

              </div>

            </section>

          )}


        {!loading &&
          !error &&
          results.shows.length > 0 && (

            <section className="search-section">

              <div className="search-section-heading">

                <div>

                  <span>
                    RESULTS
                  </span>

                  <h2>
                    TV Shows
                  </h2>

                </div>


                <strong>
                  {results.shows.length}
                </strong>

              </div>


              <div className="catalog-grid">

                {results.shows.map(
                  (show) => (

                    <ContentCard
                      key={
                        `show-${show.id}`
                      }
                      item={show}
                      type="show"
                      profileId={
                        profile?.id
                      }
                    />

                  )
                )}

              </div>

            </section>

          )}

      </div>

    </div>

  );

};


export default Search;