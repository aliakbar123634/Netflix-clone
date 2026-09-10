import ContentCard from "./ContentCard";


// ============================================================
// CONTENT ROW
// ============================================================

const ContentRow = ({
  title,
  items = [],
  type = "movie",
  profileId,
  myList = [],
  onListChange,
}) => {

  if (!items || !items.length) {
    return null;
  }


  // ==========================================================
  // GET ITEM TYPE
  // ==========================================================

  const getItemType = (item) => {

    // --------------------------------------------------------
    // Mixed rows
    // --------------------------------------------------------

    if (type === "mixed") {

      const itemType =
        item?.content_type ||
        item?.type ||
        item?.media_type;

      if (
        itemType === "episode"
      ) {
        return "episode";
      }

      if (
        itemType === "show" ||
        itemType === "tv" ||
        itemType === "tvshow" ||
        itemType === "series"
      ) {
        return "show";
      }

      return "movie";
    }


    // --------------------------------------------------------
    // Normal row
    // --------------------------------------------------------

    return type;
  };


  // ==========================================================
  // GET MY LIST ITEM ID
  // ==========================================================

  const getMyListItemId = (
    item,
    itemType
  ) => {

    // Episodes cannot be in My List

    if (
      itemType === "episode"
    ) {
      return null;
    }


    const found = myList.find(
      (listItem) => {

        const contentId =
          listItem?.content_id ??
          listItem?.object_id ??
          listItem?.content?.id;


        const contentType =
          listItem?.content_type_display ??
          listItem?.content_type ??
          null;


        const correctType =
          itemType === "movie"
            ? (
                !contentType ||
                contentType === "movie"
              )
            : (
                !contentType ||
                contentType === "show"
              );


        return (
          Number(contentId) ===
            Number(item.id) &&
          correctType
        );
      }
    );


    return found?.id || null;
  };


  // ==========================================================
  // RENDER
  // ==========================================================

  return (

    <section className="content-row">

      {/* ================================================== */}
      {/* HEADER */}
      {/* ================================================== */}

      <div className="content-row-header">

        <h2>
          {title}
        </h2>

      </div>


      {/* ================================================== */}
      {/* SCROLLER */}
      {/* ================================================== */}

      <div className="content-row-scroller">

        {items.map(
          (item, index) => {

            const itemType =
              getItemType(item);


            return (

              <ContentCard
                key={
                  `${itemType}-${item.id}-${index}`
                }
                item={item}
                type={itemType}
                profileId={profileId}
                myListItemId={
                  getMyListItemId(
                    item,
                    itemType
                  )
                }
                onListChange={
                  onListChange
                }
              />

            );

          }
        )}

      </div>

    </section>

  );
};


export default ContentRow;