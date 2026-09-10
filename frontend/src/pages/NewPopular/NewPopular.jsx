import {
  useEffect,
  useState,
} from "react";

import {
  getMoviesList,
  getTVShowsList,
} from "../../services/catalog";

import ContentRow
  from "../../components/catalog/ContentRow";


const NewPopular = () => {

  const [movies, setMovies] =
    useState([]);

  const [shows, setShows] =
    useState([]);

  const [loading, setLoading] =
    useState(true);


  useEffect(() => {

    const loadData = async () => {

      try {

        const [
          movieData,
          showData,
        ] = await Promise.all([

          getMoviesList({
            ordering: "-release_year",
          }),

          getTVShowsList({
            ordering: "-release_year",
          }),

        ]);


        setMovies(
          movieData
        );

        setShows(
          showData
        );

      } catch (error) {

        console.error(
          error
        );

      } finally {

        setLoading(false);

      }

    };


    loadData();

  }, []);


  if (loading) {

    return (

      <div className="page-loading">

        <div className="page-spinner"></div>

        <p>
          Loading...
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
          New & Popular
        </h1>

        <p>
          The latest and most popular entertainment.
        </p>

      </div>


      <ContentRow
        title="New Movies"
        items={movies}
        type="movie"
      />


      <ContentRow
        title="New TV Shows"
        items={shows}
        type="show"
      />

    </div>

  );

};


export default NewPopular;