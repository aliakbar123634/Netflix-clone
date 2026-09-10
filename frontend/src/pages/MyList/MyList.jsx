import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  getMyList,
} from "../../services/watchlist";

import ContentCard
  from "../../components/catalog/ContentCard";


const MyList = () => {

  const {
    profile,
  } = useProfile();


  const [items, setItems] =
    useState([]);


  const [loading, setLoading] =
    useState(true);


  const [error, setError] =
    useState("");


  const loadList = useCallback(
    async () => {

      if (!profile?.id) {
        return;
      }


      try {

        setLoading(true);
        setError("");


        const response =
          await getMyList(
            profile.id
          );


        const list =
          Array.isArray(response)
            ? response
            : response?.results || [];


        setItems(
          list
        );

      } catch (error) {

        console.error(
          "My List error:",
          error
        );


        setError(
          "Unable to load My List."
        );

      } finally {

        setLoading(false);

      }

    },
    [profile?.id]
  );


  useEffect(() => {

    loadList();

  }, [loadList]);


  if (loading) {

    return (

      <div className="page-loading">

        <div className="page-spinner"></div>

        <p>
          Loading My List...
        </p>

      </div>

    );

  }


  const getContent =
    (item) => {

      return (
        item?.content ||
        item
      );

    };


  const getContentType =
    (item) => {

      const type =
        item?.content_type_display ||
        item?.content_type;


      if (
        type === "show" ||
        type === "tv"
      ) {
        return "show";
      }


      return "movie";

    };


  const getContentId =
    (item) => {

      return (
        item?.content_id ||
        item?.object_id ||
        item?.content?.id ||
        null
      );

    };


  return (

    <div className="catalog-page">

      <div className="catalog-page-header">

        <span>
          STREAMFLIX
        </span>

        <h1>
          My List
        </h1>

        <p>
          Movies and shows you saved.
        </p>

      </div>


      {error && (

        <div className="catalog-error">
          {error}
        </div>

      )}


      {!items.length && !error && (

        <div className="page-message">

          <h2>
            Your list is empty
          </h2>

          <p>
            Add movies and shows to watch them later.
          </p>

        </div>

      )}


      {items.length > 0 && (

        <div className="catalog-grid">

          {items.map(
            (listItem) => {

              const content =
                getContent(
                  listItem
                );


              const contentId =
                getContentId(
                  listItem
                );


              const contentType =
                getContentType(
                  listItem
                );


              if (!contentId) {
                return null;
              }


              const cardItem = {
                ...content,
                id: contentId,
                title:
                  content?.title ||
                  listItem?.title ||
                  "Untitled",
                poster_url:
                  content?.poster_url ||
                  listItem?.poster_url ||
                  null,
              };


              return (

                <ContentCard
                  key={listItem.id}
                  item={cardItem}
                  type={contentType}
                  profileId={
                    profile?.id
                  }
                  myListItemId={
                    listItem.id
                  }
                  onListChange={
                    loadList
                  }
                />

              );

            }
          )}

        </div>

      )}

    </div>

  );

};


export default MyList;