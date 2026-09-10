
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getStream,
} from "../../services/streaming";

import {
  updateWatchProgress,
} from "../../services/history";

import {
  useProfile,
} from "../../context/ProfileContext";

import "./Watch.css";


// ============================================================
// HELPERS
// ============================================================

const formatTime = (totalSeconds) => {

  if (
    !Number.isFinite(totalSeconds) ||
    totalSeconds < 0
  ) {
    return "0:00";
  }

  const seconds = Math.floor(
    totalSeconds
  );

  const hours = Math.floor(
    seconds / 3600
  );

  const minutes = Math.floor(
    (seconds % 3600) / 60
  );

  const remainingSeconds =
    seconds % 60;

  if (hours > 0) {

    return (
      `${hours}:` +
      `${String(minutes).padStart(2, "0")}:` +
      `${String(remainingSeconds).padStart(2, "0")}`
    );
  }

  return (
    `${minutes}:` +
    `${String(remainingSeconds).padStart(2, "0")}`
  );
};


const getErrorMessage = (error) => {

  return (
    error?.response?.data?.detail ||
    error?.response?.data?.message ||
    "Unable to load this video."
  );
};


// ============================================================
// WATCH PAGE
// ============================================================

const Watch = () => {

  const {
    type,
    id,
  } = useParams();

  const navigate =
    useNavigate();

  const {
    profile,
  } = useProfile();


  // ==========================================================
  // REFS
  // ==========================================================

  const videoRef =
    useRef(null);

  const playerRef =
    useRef(null);

  const saveTimerRef =
    useRef(null);

  const controlsTimerRef =
    useRef(null);


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    stream,
    setStream,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    videoError,
    setVideoError,
  ] = useState("");

  const [
    playing,
    setPlaying,
  ] = useState(false);

  const [
    muted,
    setMuted,
  ] = useState(false);

  const [
    volume,
    setVolume,
  ] = useState(1);

  const [
    currentTime,
    setCurrentTime,
  ] = useState(0);

  const [
    duration,
    setDuration,
  ] = useState(0);

  const [
    controlsVisible,
    setControlsVisible,
  ] = useState(true);

  const [
    fullscreen,
    setFullscreen,
  ] = useState(false);

  const [
    ended,
    setEnded,
  ] = useState(false);

  const [
    saving,
    setSaving,
  ] = useState(false);

  const [
    saveError,
    setSaveError,
  ] = useState("");

  const [
    nextEpisodeLoading,
    setNextEpisodeLoading,
  ] = useState(false);

  // ==========================================================
  // VIDEO FALLBACK
  // ==========================================================
  // If a remote catalog URL fails, the player automatically
  // tries these public MP4 sources one by one.
  // Movies and episodes use the same fallback chain.
  const FALLBACK_VIDEO_URLS = [
    "https://media.w3.org/2010/05/sintel/trailer.mp4",
    "https://www.w3schools.com/html/mov_bbb.mp4",
    "https://res.cloudinary.com/demo/video/upload/dog.mp4",
    "https://res.cloudinary.com/demo/video/upload/elephants.mp4",
  ];

  const [
    fallbackIndex,
    setFallbackIndex,
  ] = useState(-1);


  // ==========================================================
  // CONTENT DATA
  // ==========================================================

  const content =
    stream?.content || null;

  const playback =
    stream?.playback || null;

  const progress =
    stream?.watch_progress || null;

  const nextEpisode =
    stream?.next_episode || null;

  const isEpisode =
    type === "episode";


  // ==========================================================
  // VIDEO URL
  // ==========================================================

  const rawVideoUrl =
    playback?.video_url ||
    content?.video_url ||
    "";

  const activeFallbackIndex =
    fallbackIndex >= 0
      ? fallbackIndex
      : !rawVideoUrl
        ? 0
        : -1;

  const videoUrl =
    activeFallbackIndex >= 0
      ? FALLBACK_VIDEO_URLS[activeFallbackIndex]
      : rawVideoUrl;

  const posterUrl =
    content?.backdrop_url ||
    content?.poster_url ||
    content?.poster ||
    content?.thumbnail_url ||
    content?.thumbnail ||
    "";


  // ==========================================================
  // LOAD STREAM
  // ==========================================================

  const loadStream =
    useCallback(
      async () => {

        if (
          !profile?.id ||
          !id
        ) {

          return;
        }

        try {

          setLoading(true);

          setError("");

          setVideoError("");

          setFallbackIndex(-1);

          setStream(null);

          setEnded(false);

          setCurrentTime(0);

          setDuration(0);

          const data =
            await getStream(
              type,
              id,
              profile.id
            );

          console.log(
            "STREAM RESPONSE:",
            data
          );

          console.log(
            "VIDEO URL:",
            data?.playback?.video_url ||
            data?.content?.video_url
          );

          console.log(
            "POSTER URL:",
            data?.content?.backdrop_url ||
            data?.content?.poster_url
          );

          setStream(data);

        } catch (error) {

          console.error(
            "Streaming error:",
            error
          );

          setError(
            getErrorMessage(error)
          );

        } finally {

          setLoading(false);
        }

      },
      [
        type,
        id,
        profile?.id,
      ]
    );


  useEffect(() => {

    loadStream();

  }, [
    loadStream,
  ]);


  // ==========================================================
  // RESET CONTROLS TIMER
  // ==========================================================

  const showControls =
    useCallback(
      () => {

        setControlsVisible(
          true
        );

        if (
          controlsTimerRef.current
        ) {

          clearTimeout(
            controlsTimerRef.current
          );
        }

        if (playing) {

          controlsTimerRef.current =
            setTimeout(
              () => {

                setControlsVisible(
                  false
                );

              },
              3000
            );
        }

      },
      [
        playing,
      ]
    );


  useEffect(() => {

    return () => {

      if (
        controlsTimerRef.current
      ) {

        clearTimeout(
          controlsTimerRef.current
        );
      }

    };

  }, []);


  // ==========================================================
  // VIDEO METADATA
  // ==========================================================

  const handleLoadedMetadata =
    () => {

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      const actualDuration =
        Number.isFinite(
          video.duration
        )
          ? video.duration
          : Number(
              content?.duration_seconds
            ) || 0;

      setDuration(
        actualDuration
      );

      const savedPosition =
        Number(
          progress?.position
        ) || 0;

      if (
        savedPosition > 0 &&
        savedPosition < actualDuration &&
        !progress?.completed
      ) {

        video.currentTime =
          Math.min(
            savedPosition,
            Math.max(
              actualDuration - 1,
              0
            )
          );

        setCurrentTime(
          Math.min(
            savedPosition,
            Math.max(
              actualDuration - 1,
              0
            )
          )
        );

      } else {

        video.currentTime = 0;

        setCurrentTime(0);
      }

    };


  // ==========================================================
  // VIDEO ERROR
  // ==========================================================

  const handleVideoError =
    () => {

      const video =
        videoRef.current;

      console.error(
        "HTML VIDEO ERROR:",
        video?.error
      );

      console.error(
        "VIDEO SOURCE:",
        video?.currentSrc ||
        videoUrl
      );

      // Try the next fallback for BOTH movies and episodes.
      // This prevents a failed remote MP4 from leaving the
      // player permanently stuck at 0:00 / 0:00.
      const nextFallbackIndex =
        activeFallbackIndex + 1;

      if (
        nextFallbackIndex <
        FALLBACK_VIDEO_URLS.length
      ) {
        console.warn(
          "Video source failed. Switching to fallback:",
          nextFallbackIndex + 1,
          FALLBACK_VIDEO_URLS[nextFallbackIndex]
        );

        setFallbackIndex(
          nextFallbackIndex
        );
        setVideoError("");
        setPlaying(false);
        setCurrentTime(0);
        setDuration(0);
        return;
      }

      setVideoError(
        "This video source could not be loaded. Please try again."
      );

      setPlaying(false);
        return;
    };



  // ==========================================================
  // PLAY
  // ==========================================================

  const handlePlay =
    async () => {

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      if (!videoUrl) {

        setVideoError(
          "No video URL is available for this content."
        );

        return;
      }

      try {

        setVideoError("");

        if (video.paused) {

          await video.play();

        } else {

          video.pause();
        }

      } catch (error) {

        console.error(
          "Video play error:",
          error
        );

        setVideoError(
          "The browser could not start this video."
        );
      }

    };


  // ==========================================================
  // VIDEO EVENTS
  // ==========================================================

  const handlePlayEvent =
    () => {

      setPlaying(true);

      setVideoError("");

      showControls();
    };


  const handlePauseEvent =
    () => {

      setPlaying(false);

      setControlsVisible(
        true
      );
    };


  const handleTimeUpdate =
    () => {

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      setCurrentTime(
        video.currentTime
      );
    };


  // ==========================================================
  // SEEK
  // ==========================================================

  const handleSeek =
    (event) => {

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      const value =
        Number(
          event.target.value
        );

      video.currentTime =
        value;

      setCurrentTime(
        value
      );
    };


  const seekBy =
    (seconds) => {

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      const target =
        Math.max(
          0,
          Math.min(
            video.duration || 0,
            video.currentTime +
              seconds
          )
        );

      video.currentTime =
        target;

      setCurrentTime(
        target
      );
    };


  // ==========================================================
  // VOLUME
  // ==========================================================

  const handleVolumeChange =
    (event) => {

      const value =
        Number(
          event.target.value
        );

      const video =
        videoRef.current;

      setVolume(
        value
      );

      if (video) {

        video.volume =
          value;

        video.muted =
          value === 0;
      }

      setMuted(
        value === 0
      );
    };


  const toggleMute =
    () => {

      const video =
        videoRef.current;

      if (!video) {
        return;
      }

      if (video.muted) {

        video.muted = false;

        setMuted(false);

        if (volume === 0) {

          setVolume(1);

          video.volume = 1;
        }

      } else {

        video.muted = true;

        setMuted(true);
      }
    };


  // ==========================================================
  // FULLSCREEN
  // ==========================================================

  const toggleFullscreen =
    async () => {

      const player =
        playerRef.current;

      if (!player) {
        return;
      }

      try {

        if (
          !document.fullscreenElement
        ) {

          await player.requestFullscreen();

        } else {

          await document.exitFullscreen();
        }

      } catch (error) {

        console.error(
          "Fullscreen error:",
          error
        );
      }

    };


  useEffect(() => {

    const handleFullscreenChange =
      () => {

        setFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );
      };

    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );

    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );
    };

  }, []);


  // ==========================================================
  // SAVE PROGRESS
  // ==========================================================

  const saveProgress =
    useCallback(
      async (
        force = false
      ) => {

        const video =
          videoRef.current;

        if (
          !video ||
          !profile?.id ||
          !content?.id
        ) {

          return;
        }

        const current =
          Number(
            video.currentTime
          ) || 0;

        const total =
          Number(
            video.duration
          ) ||
          Number(
            content.duration_seconds
          ) ||
          0;

        if (
          total <= 0 ||
          current < 0
        ) {

          return;
        }

        if (
          !force &&
          current < 1
        ) {

          return;
        }

        try {

          setSaving(true);

          setSaveError("");

          await updateWatchProgress({

            profile_id:
              profile.id,

            content_type:
              type,

            content_id:
              Number(id),

            position:
              Math.floor(current),

            duration:
              Math.floor(total),

          });

        } catch (error) {

          console.error(
            "Save watch progress error:",
            error
          );

          setSaveError(
            "Progress could not be saved."
          );

        } finally {

          setSaving(false);
        }

      },
      [
        profile?.id,
        content?.id,
        content?.duration_seconds,
        type,
        id,
      ]
    );


  // ==========================================================
  // AUTO SAVE
  // ==========================================================

  useEffect(() => {

    if (!playing) {
      return undefined;
    }

    saveTimerRef.current =
      setInterval(
        () => {

          saveProgress();

        },
        5000
      );

    return () => {

      if (
        saveTimerRef.current
      ) {

        clearInterval(
          saveTimerRef.current
        );
      }

    };

  }, [
    playing,
    saveProgress,
  ]);


  // ==========================================================
  // SAVE WHEN PAUSED
  // ==========================================================

  useEffect(() => {

    if (
      !playing &&
      currentTime > 0
    ) {

      saveProgress(true);
    }

  }, [
    playing,
  ]);


  // ==========================================================
  // VIDEO ENDED
  // ==========================================================

  const handleEnded =
    async () => {

      setPlaying(false);

      setEnded(true);

      setControlsVisible(
        true
      );

      await saveProgress(
        true
      );
    };


  // ==========================================================
  // KEYBOARD CONTROLS
  // ==========================================================

  useEffect(() => {

    const handleKeyDown =
      (event) => {

        const target =
          event.target;

        if (
          target instanceof
            HTMLInputElement ||
          target instanceof
            HTMLTextAreaElement
        ) {

          return;
        }

        switch (
          event.key.toLowerCase()
        ) {

          case " ":

            event.preventDefault();

            handlePlay();

            break;

          case "arrowleft":

            event.preventDefault();

            seekBy(-10);

            break;

          case "arrowright":

            event.preventDefault();

            seekBy(10);

            break;

          case "m":

            event.preventDefault();

            toggleMute();

            break;

          case "f":

            event.preventDefault();

            toggleFullscreen();

            break;

          default:
            break;
        }
      };

    window.addEventListener(
      "keydown",
      handleKeyDown
    );

    return () => {

      window.removeEventListener(
        "keydown",
        handleKeyDown
      );
    };

  });


  // ==========================================================
  // PLAY NEXT EPISODE
  // ==========================================================

  const handleNextEpisode =
    () => {

      if (
        !nextEpisode?.id
      ) {

        return;
      }

      setNextEpisodeLoading(
        true
      );

      navigate(
        `/watch/episode/${nextEpisode.id}`
      );
    };


  // ==========================================================
  // RETRY
  // ==========================================================

  const handleRetry =
    () => {

      setVideoError("");
      setFallbackIndex(-1);
      setCurrentTime(0);
      setDuration(0);
      setPlaying(false);
      loadStream();
    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="watch-page">

        <div className="watch-loading">

          <div className="watch-loader"></div>

          <p>
            Loading video...
          </p>

        </div>

      </div>
    );
  }


  // ==========================================================
  // API ERROR
  // ==========================================================

  if (error || !stream) {

    const subscriptionRequired =
      error.toLowerCase().includes(
        "subscription"
      );

    return (

      <div className="watch-page">

        <button
          type="button"
          className="watch-back-button"
          onClick={() =>
            navigate(-1)
          }
        >
          ← Back
        </button>

        <div className="watch-error">

          <div className="watch-error-icon">
            !
          </div>

          <h1>
            {subscriptionRequired
              ? "Subscription Required"
              : "Unable to Play"}
          </h1>

          <p>
            {error ||
              "Video could not be loaded."}
          </p>

          <div className="watch-error-actions">

            {!subscriptionRequired && (

              <button
                type="button"
                className="watch-primary-button"
                onClick={
                  handleRetry
                }
              >
                Try Again
              </button>
            )}

            <button
              type="button"
              className="watch-secondary-button"
              onClick={() =>
                navigate(-1)
              }
            >
              Go Back
            </button>

          </div>

        </div>

      </div>
    );
  }


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <div
      className={
        `watch-page ${
          fullscreen
            ? "watch-page-fullscreen"
            : ""
        }`
      }
    >

      {/* ================================================== */}
      {/* PLAYER */}
      {/* ================================================== */}

      <div
        ref={playerRef}
        className="watch-player"
        onMouseMove={
          showControls
        }
        onMouseLeave={() => {

          if (playing) {

            setControlsVisible(
              false
            );
          }

        }}
        onClick={(event) => {

          if (
            event.target ===
            event.currentTarget
          ) {

            handlePlay();
          }

        }}
      >

        {/* ================================================== */}
        {/* VIDEO */}
        {/* ================================================== */}

        {videoUrl ? (

          <video
            key={videoUrl}
            ref={videoRef}
            className="watch-video"
            src={videoUrl}
            poster={posterUrl || undefined}
            playsInline
            preload="metadata"

            onLoadedMetadata={
              handleLoadedMetadata
            }

            onCanPlay={() => {
              setVideoError("");
              setPlaying(false);
            }}

            onPlay={
              handlePlayEvent
            }

            onPause={
              handlePauseEvent
            }

            onTimeUpdate={
              handleTimeUpdate
            }

            onEnded={
              handleEnded
            }

            onClick={
              handlePlay
            }

            onError={
              handleVideoError
            }
          />

        ) : (

          <div className="watch-error">

            <div className="watch-error-icon">
              !
            </div>

            <h1>
              Video Unavailable
            </h1>

            <p>
              No video URL was returned by
              the streaming server.
            </p>

          </div>

        )}


        {/* ================================================== */}
        {/* VIDEO ERROR OVERLAY */}
        {/* ================================================== */}

        {videoError && (

          <div className="watch-video-error">

            <div className="watch-error-icon">
              !
            </div>

            <h2>
              Unable to Play
            </h2>

            <p>
              {videoError}
            </p>

            <div className="watch-error-actions">

              <button
                type="button"
                className="watch-primary-button"
                onClick={
                  handleRetry
                }
              >
                Try Again
              </button>

              <button
                type="button"
                className="watch-secondary-button"
                onClick={() =>
                  navigate(-1)
                }
              >
                Go Back
              </button>

            </div>

          </div>

        )}


        {/* ================================================== */}
        {/* TOP BAR */}
        {/* ================================================== */}

        <div
          className={
            `watch-topbar ${
              controlsVisible
                ? "watch-controls-visible"
                : ""
            }`
          }
        >

          <button
            type="button"
            className="watch-back-button"
            onClick={() =>
              navigate(-1)
            }
          >
            ←
          </button>

          <div className="watch-title-area">

            <span>
              {isEpisode
                ? "NOW WATCHING"
                : "MOVIE"}
            </span>

            <strong>
              {isEpisode &&
              stream.show
                ? stream.show.title
                : content?.title}
            </strong>

            {isEpisode && (

              <small>

                S{String(
                  stream.season?.season_number ||
                  1
                ).padStart(2, "0")}

                {" "}

                E{String(
                  content?.episode_number ||
                  1
                ).padStart(2, "0")}

                {" • "}

                {content?.title}

              </small>
            )}

          </div>

        </div>


        {/* ================================================== */}
        {/* CENTER PLAY */}
        {/* ================================================== */}

        {!playing &&
          !ended &&
          !videoError && (

            <button
              type="button"
              className="watch-center-play"
              onClick={
                handlePlay
              }
              aria-label="Play"
            >
              ▶
            </button>

          )}


        {/* ================================================== */}
        {/* END SCREEN */}
        {/* ================================================== */}

        {ended && (

          <div className="watch-ended">

            <div className="watch-ended-card">

              <span>
                {isEpisode
                  ? "EPISODE COMPLETE"
                  : "MOVIE COMPLETE"}
              </span>

              <h2>
                {content?.title}
              </h2>

              {nextEpisode && (

                <p>
                  Up next:
                  {" "}
                  S{String(
                    nextEpisode.season_number
                  ).padStart(2, "0")}
                  E{String(
                    nextEpisode.episode_number
                  ).padStart(2, "0")}
                  {" • "}
                  {nextEpisode.title}
                </p>

              )}

              <div className="watch-ended-actions">

                {nextEpisode && (

                  <button
                    type="button"
                    className="watch-primary-button"
                    onClick={
                      handleNextEpisode
                    }
                    disabled={
                      nextEpisodeLoading
                    }
                  >
                    {nextEpisodeLoading
                      ? "Loading..."
                      : "▶ Play Next"}
                  </button>

                )}

                <button
                  type="button"
                  className="watch-secondary-button"
                  onClick={() => {

                    setEnded(false);

                    if (
                      videoRef.current
                    ) {

                      videoRef.current.currentTime =
                        0;

                      setCurrentTime(0);

                    }

                  }}
                >
                  ↻ Replay
                </button>

              </div>

            </div>

          </div>

        )}


        {/* ================================================== */}
        {/* CONTROLS */}
        {/* ================================================== */}

        <div
          className={
            `watch-controls ${
              controlsVisible
                ? "watch-controls-visible"
                : ""
            }`
          }
        >

          <div className="watch-progress-wrapper">

            <input
              type="range"
              className="watch-progress"
              min="0"
              max={
                duration || 0
              }
              step="0.1"
              value={
                Math.min(
                  currentTime,
                  duration || 0
                )
              }
              onChange={
                handleSeek
              }
              style={{
                "--progress":
                  duration > 0
                    ? `${
                        (
                          currentTime /
                          duration
                        ) * 100
                      }%`
                    : "0%",
              }}
            />

          </div>


          <div className="watch-control-row">

            <div className="watch-control-left">

              <button
                type="button"
                className="watch-control-button"
                onClick={
                  handlePlay
                }
                aria-label={
                  playing
                    ? "Pause"
                    : "Play"
                }
              >
                {playing
                  ? "❚❚"
                  : "▶"}
              </button>


              <button
                type="button"
                className="watch-control-button watch-skip-button"
                onClick={() =>
                  seekBy(-10)
                }
                aria-label="Back 10 seconds"
              >
                ↶
                <small>
                  10
                </small>
              </button>


              <button
                type="button"
                className="watch-control-button watch-skip-button"
                onClick={() =>
                  seekBy(10)
                }
                aria-label="Forward 10 seconds"
              >
                ↷
                <small>
                  10
                </small>
              </button>


              <button
                type="button"
                className="watch-control-button"
                onClick={
                  toggleMute
                }
                aria-label="Mute"
              >
                {muted ||
                volume === 0
                  ? "🔇"
                  : "🔊"}
              </button>


              <input
                type="range"
                className="watch-volume"
                min="0"
                max="1"
                step="0.05"
                value={
                  muted
                    ? 0
                    : volume
                }
                onChange={
                  handleVolumeChange
                }
                aria-label="Volume"
              />


              <span className="watch-time">

                {formatTime(
                  currentTime
                )}

                {" / "}

                {formatTime(
                  duration
                )}

              </span>

            </div>


            <div className="watch-control-right">

              {stream.subscription && (

                <span className="watch-quality">

                  {stream.subscription.video_quality ||
                    playback?.quality ||
                    "Auto"}

                </span>

              )}


              {saving && (

                <span className="watch-saving">
                  Saving...
                </span>

              )}


              {!saving &&
                saveError && (

                  <span className="watch-save-error">
                    {saveError}
                  </span>

                )}


              <button
                type="button"
                className="watch-control-button"
                onClick={
                  toggleFullscreen
                }
                aria-label="Fullscreen"
              >
                ⛶
              </button>

            </div>

          </div>

        </div>

      </div>


      {/* ==================================================== */}
      {/* PLAYER INFORMATION */}
      {/* ==================================================== */}

      <section className="watch-information">

        <div className="watch-information-main">

          <div>

            <span className="watch-information-type">
              {isEpisode
                ? "SERIES"
                : "MOVIE"}
            </span>

            <h1>
              {content?.title}
            </h1>

            <div className="watch-information-meta">

              {content?.release_year && (

                <span>
                  {content.release_year}
                </span>

              )}

              {content?.maturity_rating && (

                <span>
                  {content.maturity_rating}
                </span>

              )}

              {content?.language && (

                <span>
                  {String(
                    content.language
                  ).toUpperCase()}
                </span>

              )}

              {content?.duration && (

                <span>
                  {content.duration} min
                </span>

              )}

            </div>

            {content?.description && (

              <p>
                {content.description}
              </p>

            )}

          </div>


          {stream.subscription && (

            <div className="watch-plan">

              <span>
                PLAN
              </span>

              <strong>
                {stream.subscription.plan}
              </strong>

              <small>
                {stream.subscription.video_quality}
              </small>

            </div>

          )}

        </div>


        {isEpisode &&
          nextEpisode && (

            <div className="watch-next">

              <div>

                <span>
                  UP NEXT
                </span>

                <h2>

                  S{String(
                    nextEpisode.season_number
                  ).padStart(2, "0")}

                  {" "}

                  E{String(
                    nextEpisode.episode_number
                  ).padStart(2, "0")}

                  {" — "}

                  {nextEpisode.title}

                </h2>

              </div>

              <button
                type="button"
                className="watch-primary-button"
                onClick={
                  handleNextEpisode
                }
              >
                ▶ Play Next
              </button>

            </div>

          )}

      </section>

    </div>
  );
}


export default Watch;
