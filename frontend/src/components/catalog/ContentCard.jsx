import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  addToMyList,
  removeFromMyList,
} from "../../services/watchlist";


const ContentCard = ({
  item,
  type = "movie",
  profileId,
  myListItemId = null,
  onListChange,

  progressPercentage = null,

  onRemove = null,
  removeLabel = "Remove from history",
}) => {

  const navigate = useNavigate();

  const [imageError, setImageError] =
    useState(false);

  const [saving, setSaving] =
    useState(false);

  const [isInList, setIsInList] =
    useState(
      Boolean(myListItemId)
    );

  const [currentListItemId, setCurrentListItemId] =
    useState(myListItemId);


  useEffect(() => {

    setIsInList(
      Boolean(myListItemId)
    );

    setCurrentListItemId(
      myListItemId
    );

  }, [myListItemId]);


  if (!item) {
    return null;
  }


  const id = item.id;

  const title =
    item.title ||
    "Untitled";


  const poster =
    item.poster_url ||
    item.thumbnail_url ||
    item.poster ||
    null;


  const backdrop =
    item.backdrop_url ||
    item.backdrop ||
    null;


  const description =
    item.description ||
    "Watch now on StreamFlix.";


  const isMovie =
    type === "movie";

  const isEpisode =
    type === "episode";


  const detailPath =
    isEpisode
      ? `/watch/episode/${id}`
      : isMovie
        ? `/movies/${id}`
        : `/tv-shows/${id}`;


  const handleCardClick = () => {

    navigate(
      detailPath
    );

  };


  const handlePlay = (
    event
  ) => {

    event.stopPropagation();

    navigate(
      isEpisode
        ? `/watch/episode/${id}`
        : isMovie
          ? `/watch/movie/${id}`
          : `/tv-shows/${id}`
    );

  };


  const handleMoreInfo = (
    event
  ) => {

    event.stopPropagation();

    if (
      isEpisode &&
      item.show_id
    ) {

      navigate(
        `/tv-shows/${item.show_id}`
      );

      return;
    }

    navigate(
      detailPath
    );

  };


  const handleListToggle = async (
    event
  ) => {

    event.stopPropagation();

    if (
      !profileId ||
      saving ||
      isEpisode
    ) {

      return;
    }


    try {

      setSaving(true);

      if (
        isInList &&
        currentListItemId
      ) {

        await removeFromMyList(
          currentListItemId
        );

        setIsInList(false);

        setCurrentListItemId(
          null
        );

      } else {

        const response =
          await addToMyList(
            profileId,
            isMovie
              ? "movie"
              : "show",
            id
          );

        setIsInList(true);

        setCurrentListItemId(
          response?.id || null
        );

      }


      if (onListChange) {

        await onListChange();

      }

    } catch (error) {

      console.error(
        "My List error:",
        error
      );

    } finally {

      setSaving(false);

    }

  };


  const handleRemove = async (
    event
  ) => {

    event.stopPropagation();

    if (
      !onRemove ||
      saving
    ) {

      return;
    }

    try {

      setSaving(true);

      await onRemove(
        item
      );

    } catch (error) {

      console.error(
        "Remove content error:",
        error
      );

    } finally {

      setSaving(false);

    }

  };


  const getDuration = () => {

    const duration =
      item.duration_minutes ??
      item.duration;

    if (!duration) {
      return null;
    }

    return `${duration}m`;

  };


  const getTypeLabel = () => {

    if (isEpisode) {
      return "Episode";
    }

    if (isMovie) {
      return "Movie";
    }

    return "TV Show";

  };


  const progress =
    Number(
      progressPercentage
    );


  return (

    <article
      className="content-card"
      onClick={
        handleCardClick
      }
    >

      <div className="content-card-image-wrapper">

        {poster &&
        !imageError ? (

          <img
            src={poster}
            alt={title}
            className="content-card-image"
            loading="lazy"
            onError={() =>
              setImageError(true)
            }
          />

        ) : (

          <div className="content-card-fallback">

            <span>
              {title
                .charAt(0)
                .toUpperCase()}
            </span>

          </div>

        )}


        {/* ================================================== */}
        {/* PROGRESS */}
        {/* ================================================== */}

        {Number.isFinite(progress) &&
        progress > 0 && (

          <div
            className="content-card-progress"
            aria-label={`${progress}% watched`}
          >

            <div
              className="content-card-progress-fill"
              style={{
                width: `${Math.min(
                  progress,
                  100
                )}%`,
              }}
            />

          </div>

        )}


        {/* ================================================== */}
        {/* HOVER PREVIEW */}
        {/* ================================================== */}

        <div className="content-card-preview">

          <div
            className="content-card-preview-bg"
            style={
              backdrop
                ? {
                    backgroundImage: `
                      linear-gradient(
                        180deg,
                        rgba(0,0,0,0.05),
                        rgba(0,0,0,0.95)
                      ),
                      url("${backdrop}")
                    `,
                  }
                : undefined
            }
          />

          <div className="content-card-preview-content">

            <div className="content-card-preview-actions">

              <button
                type="button"
                className="content-card-play"
                onClick={
                  handlePlay
                }
                aria-label={
                  `Play ${title}`
                }
              >
                ▶
              </button>


              {!isEpisode && (

                <button
                  type="button"
                  className="content-card-list"
                  onClick={
                    handleListToggle
                  }
                  disabled={
                    saving ||
                    !profileId
                  }
                  aria-label={
                    isInList
                      ? `Remove ${title} from My List`
                      : `Add ${title} to My List`
                  }
                >
                  {saving
                    ? "..."
                    : isInList
                      ? "✓"
                      : "+"
                  }
                </button>

              )}


              <button
                type="button"
                className="content-card-info-button"
                onClick={
                  handleMoreInfo
                }
                aria-label={
                  `More information about ${title}`
                }
              >
                ⓘ
              </button>

            </div>


            <h3>
              {title}
            </h3>


            <div className="content-card-preview-meta">

              {item.release_year && (

                <span>
                  {item.release_year}
                </span>

              )}


              {item.maturity_rating && (

                <span>
                  {item.maturity_rating}
                </span>

              )}


              {getDuration() && (

                <span>
                  {getDuration()}
                </span>

              )}


              <span>
                {getTypeLabel()}
              </span>

            </div>


            {description && (

              <p>
                {description}
              </p>

            )}

          </div>

        </div>


        {/* ================================================== */}
        {/* NORMAL OVERLAY */}
        {/* ================================================== */}

        <div className="content-card-overlay">

          <button
            type="button"
            className="content-card-play"
            onClick={
              handlePlay
            }
            aria-label={
              `Play ${title}`
            }
          >
            ▶
          </button>


          {!isEpisode && (

            <button
              type="button"
              className="content-card-list"
              onClick={
                handleListToggle
              }
              disabled={
                saving ||
                !profileId
              }
              aria-label={
                isInList
                  ? `Remove ${title} from My List`
                  : `Add ${title} to My List`
              }
            >
              {saving
                ? "..."
                : isInList
                  ? "✓"
                  : "+"
              }
            </button>

          )}

        </div>

      </div>


      {/* ================================================== */}
      {/* CARD INFO */}
      {/* ================================================== */}

      <div className="content-card-info">

        <h3>
          {title}
        </h3>


        <div className="content-card-meta">

          {item.release_year && (

            <span>
              {item.release_year}
            </span>

          )}


          {item.maturity_rating && (

            <span>
              {item.maturity_rating}
            </span>

          )}


          {getDuration() && (

            <span>
              {getDuration()}
            </span>

          )}

        </div>


        {/* ================================================== */}
        {/* HISTORY REMOVE */}
        {/* ================================================== */}

        {onRemove && (

          <button
            type="button"
            className="content-card-remove"
            onClick={
              handleRemove
            }
            disabled={saving}
          >
            {saving
              ? "Removing..."
              : removeLabel}
          </button>

        )}

      </div>

    </article>

  );

};


export default ContentCard;