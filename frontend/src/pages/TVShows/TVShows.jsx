import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  getTVShows,
} from "../../services/catalog";

import {
  getMyList,
} from "../../services/watchlist";

import ContentCard
  from "../../components/catalog/ContentCard";


const TVShows = () => {

  const {
    profile,
  } = useProfile();


  const [
    shows,
    setShows,
  ] = useState([]);


  const [
    myList,
    setMyList,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // KIDS FILTER
  // ==========================================================

  const filterShowsForProfile = (
    showList
  ) => {

    if (!profile?.is_kids) {

      return showList;

    }


    const allowedRatings = [
      "all",
      "7+",
    ];


    return showList.filter(
      (show) =>
        allowedRatings.includes(
          show?.maturity_rating
        )
    );

  };


  // ==========================================================
  // LOAD SHOWS
  // ==========================================================

  const loadShows = useCallback(
    async () => {

      try {

        setLoading(true);
        setError("");


        const showResponse =
          await getTVShows();


        const showList =
          Array.isArray(showResponse)
            ? showResponse
            : showResponse?.results || [];


        const filteredShows =
          filterShowsForProfile(
            showList
          );


        setShows(
          filteredShows
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


          setMyList(
            list
          );

        }


      } catch (error) {

        console.error(
          "TV Shows error:",
          error
        );


        setError(
          "Unable to load TV shows."
        );


      } finally {

        setLoading(false);

      }

    },
    [profile?.id, profile?.is_kids]
  );


  useEffect(() => {

    loadShows();

  }, [loadShows]);


  // ==========================================================
  // MY LIST ITEM
  // ==========================================================

  const getMyListItemId = (
    show
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
              Number(show.id)

            &&

            (
              !contentType ||
              contentType === "show"
            )

          );

        }
      );


    return found?.id || null;

  };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="page-loading">

        <div className="page-spinner"></div>

        <p>
          Loading TV shows...
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
          {profile?.is_kids
            ? "Kids Shows"
            : "TV Shows"
          }
        </h1>

        <p>
          {profile?.is_kids
            ? "Family-friendly series to enjoy."
            : "Binge your favorite series."
          }
        </p>

      </div>


      {error && (

        <div className="catalog-error">
          {error}
        </div>

      )}


      {!shows.length &&
        !error && (

        <div className="page-message">

          <h2>
            {profile?.is_kids
              ? "No kids shows available"
              : "No TV shows available"
            }
          </h2>

          <p>
            More shows will appear here once they are published.
          </p>

        </div>

      )}


      {shows.length > 0 && (

        <div className="catalog-grid">

          {shows.map(
            (show) => (

              <ContentCard
                key={show.id}
                item={show}
                type="show"
                profileId={
                  profile?.id
                }
                myListItemId={
                  getMyListItemId(
                    show
                  )
                }
                onListChange={
                  loadShows
                }
              />

            )
          )}

        </div>

      )}

    </div>

  );

};


export default TVShows;