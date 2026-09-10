import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  getContinueWatching,
  getWatchHistory,
  deleteHistoryItem,
} from "../../services/history";

import ContentCard
  from "../../components/catalog/ContentCard";

import "./History.css";


// ============================================================
// NORMALIZE API RESPONSE
// ============================================================

const normalizeResponse = (
  response
) => {

  if (Array.isArray(response)) {
    return response;
  }

  return response?.results || [];

};


// ============================================================
// HISTORY PAGE
// ============================================================

const History = () => {

  const {
    profile,
  } = useProfile();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    continueWatching,
    setContinueWatching,
  ] = useState([]);


  const [
    history,
    setHistory,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    error,
    setError,
  ] = useState("");


  const [
    removingId,
    setRemovingId,
  ] = useState(null);


  // ==========================================================
  // LOAD HISTORY
  // ==========================================================

  const loadHistory = useCallback(
    async () => {

      // ------------------------------------------------------
      // NO PROFILE
      // ------------------------------------------------------

      if (!profile?.id) {

        setContinueWatching([]);

        setHistory([]);

        setLoading(false);

        return;
      }


      try {

        setLoading(true);

        setError("");


        // ----------------------------------------------------
        // LOAD BOTH IN PARALLEL
        // ----------------------------------------------------

        const [
          continueResponse,
          historyResponse,
        ] = await Promise.all([

          getContinueWatching(
            profile.id
          ),

          getWatchHistory({
            profile_id:
              profile.id,
          }),

        ]);


        // ----------------------------------------------------
        // SET CONTINUE WATCHING
        // ----------------------------------------------------

        setContinueWatching(
          normalizeResponse(
            continueResponse
          )
        );


        // ----------------------------------------------------
        // SET HISTORY
        // ----------------------------------------------------

        setHistory(
          normalizeResponse(
            historyResponse
          )
        );

      } catch (loadError) {

        console.error(
          "History loading error:",
          loadError
        );

        setError(
          "Unable to load your watch history."
        );

      } finally {

        setLoading(false);

      }

    },
    [
      profile?.id,
    ]
  );


  // ==========================================================
  // INITIAL LOAD
  // ==========================================================

  useEffect(() => {

    loadHistory();

  }, [
    loadHistory,
  ]);


  // ==========================================================
  // REMOVE HISTORY ITEM
  // ==========================================================

  const handleRemoveHistory = async (
    item
  ) => {

    // --------------------------------------------------------
    // IMPORTANT:
    //
    // cardItem.id = content/movie/episode ID
    //
    // cardItem.history_id =
    // actual WatchHistory database row ID
    //
    // We MUST delete using history_id.
    // --------------------------------------------------------

    const historyId =
      item?.history_id ||
      item?.historyId ||
      item?.id;


    if (!historyId) {

      console.error(
        "Unable to remove history item: missing history ID.",
        item
      );

      return;
    }


    try {

      setRemovingId(
        historyId
      );


      // ------------------------------------------------------
      // DELETE ACTUAL HISTORY RECORD
      // ------------------------------------------------------

      await deleteHistoryItem(
        historyId
      );


      // ------------------------------------------------------
      // REMOVE FROM LOCAL STATE
      // ------------------------------------------------------

      setHistory(
        (current) =>
          current.filter(
            (historyItem) =>
              historyItem.id !==
              historyId
          )
      );

    } catch (removeError) {

      console.error(
        "History removal error:",
        removeError
      );

      setError(
        "Unable to remove this item from your history."
      );

    } finally {

      setRemovingId(
        null
      );

    }

  };


  // ==========================================================
  // NO PROFILE
  // ==========================================================

  if (!profile) {

    return (

      <div className="page-message">

        <h2>
          Select a profile
        </h2>

        <p>
          Please select a profile before
          viewing your watch history.
        </p>

      </div>

    );

  }


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="page-loading">

        <div className="page-spinner"></div>

        <p>
          Loading your history...
        </p>

      </div>

    );

  }


  // ==========================================================
  // ERROR
  // ==========================================================

  if (error) {

    return (

      <div className="page-message">

        <h2>
          Something went wrong
        </h2>

        <p>
          {error}
        </p>

        <button
          type="button"
          className="hero-play-button"
          onClick={
            loadHistory
          }
        >
          Try Again
        </button>

      </div>

    );

  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div className="history-page">


      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <header className="history-header">

        <span>
          STREAMFLIX
        </span>


        <h1>
          My Activity
        </h1>


        <p>
          Continue watching what you started
          and manage your watch history.
        </p>

      </header>


      {/* ================================================== */}
      {/* CONTINUE WATCHING */}
      {/* ================================================== */}

      <section className="history-section">

        <div className="history-section-header">

          <h2>
            Continue Watching
          </h2>


          <span>
            {
              continueWatching.length
            }
          </span>

        </div>


        {continueWatching.length > 0 ? (

          <div className="history-grid">

            {continueWatching.map(
              (item) => {

                // ------------------------------------------------
                // DETERMINE CONTENT TYPE
                // ------------------------------------------------

                const type =
                  item?.content_type ||
                  item?.content_type_display ||
                  "movie";


                const cardType =
                  type === "episode"
                    ? "episode"
                    : "movie";


                // ------------------------------------------------
                // NORMALIZE CONTENT FOR CONTENT CARD
                // ------------------------------------------------

                const cardItem = {

                  ...item,


                  // Content ID is needed by ContentCard
                  id:
                    item?.content_id ||
                    item?.id,


                  title:
                    item?.title ||
                    "Untitled",


                  poster_url:
                    item?.poster_url ||
                    null,


                  backdrop_url:
                    item?.backdrop_url ||
                    null,


                  release_year:
                    item?.release_year ||
                    null,


                  maturity_rating:
                    item?.maturity_rating ||
                    null,


                  duration_minutes:
                    item?.duration_minutes ||
                    null,


                  show_id:
                    item?.show_id ||
                    null,


                  // Continue watching doesn't need
                  // history deletion, but preserve it
                  // if backend provides it.
                  history_id:
                    item?.history_id ||
                    item?.historyId ||
                    null,

                };


                return (

                  <ContentCard
                    key={
                      `continue-${
                        item?.id ||
                        item?.content_id
                      }`
                    }

                    item={
                      cardItem
                    }

                    type={
                      cardType
                    }

                    profileId={
                      profile.id
                    }

                    progressPercentage={
                      item?.progress_percentage
                    }

                  />

                );

              }
            )}

          </div>

        ) : (

          <div className="history-empty">

            <div className="history-empty-icon">
              ▶
            </div>


            <h3>
              Nothing to continue
            </h3>


            <p>
              Start watching a movie or
              episode and it will appear here.
            </p>

          </div>

        )}

      </section>


      {/* ================================================== */}
      {/* WATCH HISTORY */}
      {/* ================================================== */}

      <section className="history-section">

        <div className="history-section-header">

          <h2>
            Watch History
          </h2>


          <span>
            {
              history.length
            }
          </span>

        </div>


        {history.length > 0 ? (

          <div className="history-grid">

            {history.map(
              (item) => {

                // ------------------------------------------------
                // CONTENT TYPE
                // ------------------------------------------------

                const type =
                  item?.content_type ||
                  item?.content_type_display ||
                  "movie";


                const cardType =
                  type === "episode"
                    ? "episode"
                    : "movie";


                // ------------------------------------------------
                // ACTUAL HISTORY RECORD ID
                // ------------------------------------------------

                const historyId =
                  item?.id;


                // ------------------------------------------------
                // CONTENT ID
                // ------------------------------------------------

                const contentId =
                  item?.content_id ||
                  item?.object_id ||
                  item?.content?.id ||
                  item?.id;


                // ------------------------------------------------
                // CARD ITEM
                // ------------------------------------------------

                const cardItem = {

                  ...item,


                  // IMPORTANT:
                  // ContentCard needs content ID
                  // for opening movie/episode.
                  id:
                    contentId,


                  // IMPORTANT:
                  // Keep database WatchHistory ID
                  // separately for deletion.
                  history_id:
                    historyId,


                  title:
                    item?.title ||
                    item?.content?.title ||
                    "Untitled",


                  poster_url:
                    item?.poster_url ||
                    item?.content?.poster_url ||
                    null,


                  backdrop_url:
                    item?.backdrop_url ||
                    item?.content?.backdrop_url ||
                    null,


                  release_year:
                    item?.release_year ||
                    item?.content?.release_year ||
                    null,


                  maturity_rating:
                    item?.maturity_rating ||
                    item?.content?.maturity_rating ||
                    null,


                  duration_minutes:
                    item?.duration_minutes ||
                    item?.content?.duration_minutes ||
                    null,


                  show_id:
                    item?.show_id ||
                    item?.content?.show_id ||
                    null,

                };


                return (

                  <ContentCard
                    key={
                      `history-${historyId}`
                    }

                    item={
                      cardItem
                    }

                    type={
                      cardType
                    }

                    profileId={
                      profile.id
                    }

                    onRemove={
                      handleRemoveHistory
                    }

                    removeLabel={
                      removingId ===
                      historyId
                        ? "Removing..."
                        : "Remove from history"
                    }

                  />

                );

              }
            )}

          </div>

        ) : (

          <div className="history-empty">

            <div className="history-empty-icon">
              ✓
            </div>


            <h3>
              Your history is empty
            </h3>


            <p>
              Movies and episodes you watch
              will appear here.
            </p>

          </div>

        )}

      </section>


    </div>

  );

};


export default History;