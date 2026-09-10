import ContentRow from "./ContentRow";


const SimilarContent = ({
  movies = [],
  shows = [],
  profileId,
}) => {

  const hasMovies =
    Array.isArray(movies) &&
    movies.length > 0;

  const hasShows =
    Array.isArray(shows) &&
    shows.length > 0;


  if (!hasMovies && !hasShows) {
    return null;
  }


  return (

    <section className="similar-content-section">

      <div className="similar-content-header">

        <span className="similar-content-eyebrow">
          MORE TO WATCH
        </span>

        <h2>
          Similar Content
        </h2>

      </div>


      {hasMovies && (

        <ContentRow
          title="More Like This"
          items={movies}
          type="movie"
          profileId={profileId}
        />

      )}


      {hasShows && (

        <ContentRow
          title="You May Also Like"
          items={shows}
          type="show"
          profileId={profileId}
        />

      )}

    </section>

  );
};


export default SimilarContent;