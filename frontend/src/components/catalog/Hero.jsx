import { useNavigate } from "react-router-dom";


const Hero = ({
  item,
  type = "movie",
}) => {

  const navigate =
    useNavigate();


  if (!item) {
    return null;
  }


  const backdrop =
    item.backdrop_url ||
    item.backdrop ||
    null;


  const title =
    item.title ||
    "Untitled";


  const description =
    item.description ||
    "Watch now on StreamFlix.";


  const isMovie =
    type === "movie";


  const handlePlay = () => {

    navigate(
      isMovie
        ? `/watch/movie/${item.id}`
        : `/tv-shows/${item.id}`
    );

  };


  const handleMoreInfo = () => {

    navigate(
      isMovie
        ? `/movies/${item.id}`
        : `/tv-shows/${item.id}`
    );

  };


  return (

    <section
      className="home-hero"
      style={
        backdrop
          ? {
              backgroundImage: `
                linear-gradient(
                  90deg,
                  rgba(0,0,0,0.96) 0%,
                  rgba(0,0,0,0.78) 38%,
                  rgba(0,0,0,0.30) 72%,
                  rgba(0,0,0,0.05) 100%
                ),
                linear-gradient(
                  0deg,
                  #090909 0%,
                  transparent 40%
                ),
                url("${backdrop}")
              `,
            }
          : undefined
      }
    >

      <div className="home-hero-content">

        <span className="home-hero-brand">
          STREAMFLIX
        </span>


        <h1>
          {title}
        </h1>


        <div className="home-hero-meta">

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


          {item.duration && isMovie && (
            <span>
              {item.duration} min
            </span>
          )}


          {!isMovie && (
            <span>
              TV Show
            </span>
          )}

        </div>


        <p>
          {description}
        </p>


        <div className="home-hero-actions">

          <button
            type="button"
            className="hero-play-button"
            onClick={handlePlay}
          >
            ▶ Play
          </button>


          <button
            type="button"
            className="hero-info-button"
            onClick={handleMoreInfo}
          >
            ⓘ More Info
          </button>

        </div>

      </div>

    </section>
  );
};


export default Hero;