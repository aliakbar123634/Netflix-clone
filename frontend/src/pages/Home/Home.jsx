// import {
//   useCallback,
//   useEffect,
//   useMemo,
//   useState,
// } from "react";

// import {
//   useProfile,
// } from "../../context/ProfileContext";

// import {
//   getHome,
// } from "../../services/discovery";

// import {
//   getMyList,
// } from "../../services/watchlist";

// import {
//   getRecommendations,
// } from "../../services/recommendations";

// import Hero
//   from "../../components/catalog/Hero";

// import ContentRow
//   from "../../components/catalog/ContentRow";

// import "./KidsHome.css";


// // ============================================================
// // HOME PAGE
// // ============================================================

// const Home = () => {

//   const {
//     profile,
//   } = useProfile();


//   // ==========================================================
//   // STATE
//   // ==========================================================

//   const [
//     homeData,
//     setHomeData,
//   ] = useState(null);


//   const [
//     recommendationData,
//     setRecommendationData,
//   ] = useState(null);


//   const [
//     myList,
//     setMyList,
//   ] = useState([]);


//   const [
//     loading,
//     setLoading,
//   ] = useState(true);


//   const [
//     recommendationLoading,
//     setRecommendationLoading,
//   ] = useState(false);


//   const [
//     error,
//     setError,
//   ] = useState("");


//   // ==========================================================
//   // LOAD HOME
//   // ==========================================================

//   const loadHome = useCallback(
//     async () => {

//       if (!profile?.id) {
//         return;
//       }


//       try {

//         setLoading(true);
//         setError("");


//         // ----------------------------------------------------
//         // Load Home + My List
//         // ----------------------------------------------------

//         const [
//           homeResponse,
//           myListResponse,
//         ] = await Promise.all([

//           getHome(
//             profile.id
//           ),

//           getMyList(
//             profile.id
//           ),

//         ]);


//         setHomeData(
//           homeResponse
//         );


//         const list =
//           Array.isArray(
//             myListResponse
//           )
//             ? myListResponse
//             : myListResponse?.results ||
//               [];


//         setMyList(
//           list
//         );


//       } catch (error) {

//         console.error(
//           "Home loading error:",
//           error
//         );


//         setError(
//           "Unable to load your home page."
//         );


//       } finally {

//         setLoading(false);

//       }

//     },
//     [profile?.id]
//   );


//   // ==========================================================
//   // LOAD RECOMMENDATIONS
//   // ==========================================================

//   const loadRecommendations =
//     useCallback(
//       async () => {

//         if (!profile?.id) {
//           return;
//         }


//         try {

//           setRecommendationLoading(
//             true
//           );


//           const response =
//             await getRecommendations(
//               profile.id
//             );


//           setRecommendationData(
//             response
//           );


//         } catch (error) {

//           console.error(
//             "Recommendation loading error:",
//             error
//           );


//           // --------------------------------------------------
//           // Recommendations should NOT break Home page
//           // --------------------------------------------------

//           setRecommendationData(
//             null
//           );


//         } finally {

//           setRecommendationLoading(
//             false
//           );

//         }

//       },
//       [profile?.id]
//     );


//   // ==========================================================
//   // INITIAL LOAD
//   // ==========================================================

//   useEffect(() => {

//     loadHome();

//   }, [loadHome]);


//   // ==========================================================
//   // LOAD RECOMMENDATIONS
//   // ==========================================================

//   useEffect(() => {

//     loadRecommendations();

//   }, [loadRecommendations]);


//   // ==========================================================
//   // NO PROFILE
//   // ==========================================================

//   if (!profile) {

//     return (

//       <div className="page-message">

//         <h2>
//           Select a profile
//         </h2>

//         <p>
//           Please select a profile before
//           continuing.
//         </p>

//       </div>

//     );

//   }


//   // ==========================================================
//   // LOADING
//   // ==========================================================

//   if (loading) {

//     return (

//       <div className="page-loading">

//         <div className="page-spinner"></div>

//         <p>
//           Loading StreamFlix...
//         </p>

//       </div>

//     );

//   }


//   // ==========================================================
//   // ERROR
//   // ==========================================================

//   if (error) {

//     return (

//       <div className="page-message">

//         <h2>
//           Something went wrong
//         </h2>

//         <p>
//           {error}
//         </p>

//         <button
//           type="button"
//           className="hero-play-button"
//           onClick={loadHome}
//         >
//           Try Again
//         </button>

//       </div>

//     );

//   }


//   // ==========================================================
//   // EMPTY HOME
//   // ==========================================================

//   if (!homeData) {

//     return (

//       <div className="page-message">

//         <h2>
//           Nothing to show
//         </h2>

//         <p>
//           Your StreamFlix home page is empty.
//         </p>

//       </div>

//     );

//   }


//   // ==========================================================
//   // HERO
//   // ==========================================================

//   const hero =
//     homeData.hero;


//   const heroType =
//     hero?.content_type ||
//     hero?.type ||
//     "movie";


//   // ==========================================================
//   // KIDS MODE
//   // ==========================================================

//   const isKids =
//     Boolean(
//       profile.is_kids
//     );


//   // ==========================================================
//   // RECOMMENDATION DATA
//   // ==========================================================

//   const recommendationMovies =
//     Array.isArray(
//       recommendationData?.movies
//     )
//       ? recommendationData.movies
//       : [];


//   const recommendationShows =
//     Array.isArray(
//       recommendationData?.shows
//     )
//       ? recommendationData.shows
//       : [];


//   // ==========================================================
//   // ADD CONTENT TYPE
//   // ==========================================================

//   const typedMovies =
//     useMemo(
//       () => {

//         return recommendationMovies.map(
//           (item) => ({
//             ...item,
//             content_type: "movie",
//           })
//         );

//       },
//       [recommendationMovies]
//     );


//   const typedShows =
//     useMemo(
//       () => {

//         return recommendationShows.map(
//           (item) => ({
//             ...item,
//             content_type: "show",
//           })
//         );

//       },
//       [recommendationShows]
//     );


//   // ==========================================================
//   // COMBINED RECOMMENDATIONS
//   // ==========================================================

//   const recommendedItems =
//     useMemo(
//       () => {

//         return [
//           ...typedMovies,
//           ...typedShows,
//         ];

//       },
//       [
//         typedMovies,
//         typedShows,
//       ]
//     );


//   // ==========================================================
//   // RECOMMENDATION LABEL
//   // ==========================================================

//   const basedOn =
//     Array.isArray(
//       recommendationData?.based_on
//     )
//       ? recommendationData.based_on
//       : [];


//   const becauseYouWatchedTitle =
//     basedOn.length > 0
//       ? `Because You Watched • ${basedOn.slice(0, 3).join(", ")}`
//       : "Because You Watched";


//   // ==========================================================
//   // FINAL RENDER
//   // ==========================================================

//   return (

//     <div
//       className={
//         isKids
//           ? "home-page kids-home-page"
//           : "home-page"
//       }
//     >

//       {/* ================================================== */}
//       {/* KIDS HEADER */}
//       {/* ================================================== */}

//       {isKids && (

//         <div className="kids-home-banner">

//           <div className="kids-home-brand">

//             STREAMFLIX

//           </div>

//           <div className="kids-home-title">

//             Kids & Family

//           </div>

//           <div className="kids-home-subtitle">

//             Fun, friendly and
//             age-appropriate entertainment.

//           </div>

//         </div>

//       )}


//       {/* ================================================== */}
//       {/* HERO */}
//       {/* ================================================== */}

//       <Hero
//         item={hero}
//         type={heroType}
//       />


//       {/* ================================================== */}
//       {/* CONTENT */}
//       {/* ================================================== */}

//       <main className="home-content">


//         {/* ================================================== */}
//         {/* CONTINUE WATCHING */}
//         {/* ================================================== */}

//         <ContentRow
//           title={
//             isKids
//               ? "Keep Watching"
//               : "Continue Watching"
//           }
//           items={
//             homeData.continue_watching ||
//             []
//           }
//           type="mixed"
//           profileId={profile.id}
//           myList={myList}
//           onListChange={loadHome}
//         />


//         {/* ================================================== */}
//         {/* MY LIST */}
//         {/* ================================================== */}

//         <ContentRow
//           title="My List"
//           items={
//             homeData.my_list ||
//             []
//           }
//           type="mixed"
//           profileId={profile.id}
//           myList={myList}
//           onListChange={loadHome}
//         />


//         {/* ================================================== */}
//         {/* TRENDING */}
//         {/* ================================================== */}

//         <ContentRow
//           title={
//             isKids
//               ? "Popular with Kids"
//               : "Trending Now"
//           }
//           items={
//             homeData.trending ||
//             []
//           }
//           type="mixed"
//           profileId={profile.id}
//           myList={myList}
//           onListChange={loadHome}
//         />


//         {/* ================================================== */}
//         {/* POPULAR */}
//         {/* ================================================== */}

//         <ContentRow
//           title={
//             isKids
//               ? "More Fun to Watch"
//               : "Popular on StreamFlix"
//           }
//           items={
//             homeData.popular ||
//             []
//           }
//           type="mixed"
//           profileId={profile.id}
//           myList={myList}
//           onListChange={loadHome}
//         />


//         {/* ================================================== */}
//         {/* NEW RELEASES */}
//         {/* ================================================== */}

//         <ContentRow
//           title={
//             isKids
//               ? "New Kids Releases"
//               : "New Releases"
//           }
//           items={
//             homeData.new_releases ||
//             []
//           }
//           type="mixed"
//           profileId={profile.id}
//           myList={myList}
//           onListChange={loadHome}
//         />


//         {/* ================================================== */}
//         {/* RECOMMENDATIONS */}
//         {/* ================================================== */}

//         {!recommendationLoading &&
//         recommendedItems.length > 0 && (

//           <>

//             {/* ============================================ */}
//             {/* BECAUSE YOU WATCHED */}
//             {/* ============================================ */}

//             <ContentRow
//               title={
//                 isKids
//                   ? "Recommended For You"
//                   : becauseYouWatchedTitle
//               }
//               items={
//                 recommendedItems
//               }
//               type="mixed"
//               profileId={profile.id}
//               myList={myList}
//               onListChange={
//                 loadHome
//               }
//             />


//             {/* ============================================ */}
//             {/* RECOMMENDED FOR YOU */}
//             {/* ============================================ */}

//             <ContentRow
//               title={
//                 isKids
//                   ? "More Picks For You"
//                   : "Recommended For You"
//               }
//               items={
//                 recommendedItems
//               }
//               type="mixed"
//               profileId={profile.id}
//               myList={myList}
//               onListChange={
//                 loadHome
//               }
//             />

//           </>

//         )}


//         {/* ================================================== */}
//         {/* EMPTY RECOMMENDATIONS */}
//         {/* ================================================== */}

//         {!recommendationLoading &&
//         recommendationData &&
//         recommendedItems.length === 0 && (

//           <section className="recommendations-empty">

//             <div>

//               <span>
//                 STREAMFLIX
//               </span>

//               <h2>
//                 Discover something new
//               </h2>

//               <p>
//                 Keep watching movies and shows
//                 to get personalized recommendations.
//               </p>

//             </div>

//           </section>

//         )}

//       </main>

//     </div>

//   );

// };


// export default Home;














import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useProfile,
} from "../../context/ProfileContext";

import {
  getHome,
} from "../../services/discovery";

import {
  getMyList,
} from "../../services/watchlist";

import {
  getRecommendations,
} from "../../services/recommendations";

import Hero
  from "../../components/catalog/Hero";

import ContentRow
  from "../../components/catalog/ContentRow";

import "./KidsHome.css";


// ============================================================
// HOME PAGE
// ============================================================

const Home = () => {

  const {
    profile,
  } = useProfile();


  // ==========================================================
  // STATE
  // ==========================================================

  const [
    homeData,
    setHomeData,
  ] = useState(null);


  const [
    recommendationData,
    setRecommendationData,
  ] = useState(null);


  const [
    myList,
    setMyList,
  ] = useState([]);


  const [
    loading,
    setLoading,
  ] = useState(true);


  const [
    recommendationLoading,
    setRecommendationLoading,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // LOAD HOME
  // ==========================================================

  const loadHome = useCallback(
    async () => {

      if (!profile?.id) {
        return;
      }


      try {

        setLoading(true);
        setError("");


        // ----------------------------------------------------
        // Load Home + My List
        // ----------------------------------------------------

        const [
          homeResponse,
          myListResponse,
        ] = await Promise.all([

          getHome(
            profile.id
          ),

          getMyList(
            profile.id
          ),

        ]);


        setHomeData(
          homeResponse
        );


        const list =
          Array.isArray(
            myListResponse
          )
            ? myListResponse
            : myListResponse?.results ||
              [];


        setMyList(
          list
        );


      } catch (error) {

        console.error(
          "Home loading error:",
          error
        );


        setError(
          "Unable to load your home page."
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
  // LOAD RECOMMENDATIONS
  // ==========================================================

  const loadRecommendations =
    useCallback(
      async () => {

        if (!profile?.id) {
          return;
        }


        try {

          setRecommendationLoading(
            true
          );


          const response =
            await getRecommendations(
              profile.id
            );


          setRecommendationData(
            response
          );


        } catch (error) {

          console.error(
            "Recommendation loading error:",
            error
          );


          // --------------------------------------------------
          // Recommendations should NOT break Home page
          // --------------------------------------------------

          setRecommendationData(
            null
          );


        } finally {

          setRecommendationLoading(
            false
          );

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

    loadHome();

  }, [
    loadHome,
  ]);


  // ==========================================================
  // LOAD RECOMMENDATIONS
  // ==========================================================

  useEffect(() => {

    loadRecommendations();

  }, [
    loadRecommendations,
  ]);


  // ==========================================================
  // KIDS MODE
  // ==========================================================

  const isKids =
    Boolean(
      profile?.is_kids
    );


  // ==========================================================
  // HERO DATA
  // ==========================================================

  const hero =
    homeData?.hero ||
    null;


  const heroType =
    hero?.content_type ||
    hero?.type ||
    "movie";


  // ==========================================================
  // RECOMMENDATION DATA
  // ==========================================================

  const recommendationMovies =
    Array.isArray(
      recommendationData?.movies
    )
      ? recommendationData.movies
      : [];


  const recommendationShows =
    Array.isArray(
      recommendationData?.shows
    )
      ? recommendationData.shows
      : [];


  // ==========================================================
  // ADD CONTENT TYPE
  // ==========================================================

  const typedMovies =
    recommendationMovies.map(
      (item) => ({
        ...item,
        content_type: "movie",
      })
    );


  const typedShows =
    recommendationShows.map(
      (item) => ({
        ...item,
        content_type: "show",
      })
    );


  // ==========================================================
  // COMBINED RECOMMENDATIONS
  // ==========================================================

  const recommendedItems = [
    ...typedMovies,
    ...typedShows,
  ];


  // ==========================================================
  // RECOMMENDATION LABEL
  // ==========================================================

  const basedOn =
    Array.isArray(
      recommendationData?.based_on
    )
      ? recommendationData.based_on
      : [];


  const becauseYouWatchedTitle =
    basedOn.length > 0
      ? `Because You Watched • ${basedOn
          .slice(0, 3)
          .join(", ")}`
      : "Because You Watched";


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
          continuing.
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
          Loading StreamFlix...
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
          onClick={loadHome}
        >
          Try Again
        </button>

      </div>

    );

  }


  // ==========================================================
  // EMPTY HOME
  // ==========================================================

  if (!homeData) {

    return (

      <div className="page-message">

        <h2>
          Nothing to show
        </h2>

        <p>
          Your StreamFlix home page is empty.
        </p>

      </div>

    );

  }


  // ==========================================================
  // FINAL RENDER
  // ==========================================================

  return (

    <div
      className={
        isKids
          ? "home-page kids-home-page"
          : "home-page"
      }
    >

      {/* ================================================== */}
      {/* KIDS HEADER */}
      {/* ================================================== */}

      {isKids && (

        <div className="kids-home-banner">

          <div className="kids-home-brand">
            STREAMFLIX
          </div>


          <div className="kids-home-title">
            Kids & Family
          </div>


          <div className="kids-home-subtitle">
            Fun, friendly and
            age-appropriate entertainment.
          </div>

        </div>

      )}


      {/* ================================================== */}
      {/* HERO */}
      {/* ================================================== */}

      <Hero
        item={hero}
        type={heroType}
      />


      {/* ================================================== */}
      {/* CONTENT */}
      {/* ================================================== */}

      <main className="home-content">


        {/* ================================================== */}
        {/* CONTINUE WATCHING */}
        {/* ================================================== */}

        <ContentRow
          title={
            isKids
              ? "Keep Watching"
              : "Continue Watching"
          }
          items={
            homeData.continue_watching ||
            []
          }
          type="mixed"
          profileId={
            profile.id
          }
          myList={
            myList
          }
          onListChange={
            loadHome
          }
        />


        {/* ================================================== */}
        {/* MY LIST */}
        {/* ================================================== */}

        <ContentRow
          title="My List"
          items={
            homeData.my_list ||
            []
          }
          type="mixed"
          profileId={
            profile.id
          }
          myList={
            myList
          }
          onListChange={
            loadHome
          }
        />


        {/* ================================================== */}
        {/* TRENDING */}
        {/* ================================================== */}

        <ContentRow
          title={
            isKids
              ? "Popular with Kids"
              : "Trending Now"
          }
          items={
            homeData.trending ||
            []
          }
          type="mixed"
          profileId={
            profile.id
          }
          myList={
            myList
          }
          onListChange={
            loadHome
          }
        />


        {/* ================================================== */}
        {/* POPULAR */}
        {/* ================================================== */}

        <ContentRow
          title={
            isKids
              ? "More Fun to Watch"
              : "Popular on StreamFlix"
          }
          items={
            homeData.popular ||
            []
          }
          type="mixed"
          profileId={
            profile.id
          }
          myList={
            myList
          }
          onListChange={
            loadHome
          }
        />


        {/* ================================================== */}
        {/* NEW RELEASES */}
        {/* ================================================== */}

        <ContentRow
          title={
            isKids
              ? "New Kids Releases"
              : "New Releases"
          }
          items={
            homeData.new_releases ||
            []
          }
          type="mixed"
          profileId={
            profile.id
          }
          myList={
            myList
          }
          onListChange={
            loadHome
          }
        />


        {/* ================================================== */}
        {/* RECOMMENDATIONS */}
        {/* ================================================== */}

        {!recommendationLoading &&
          recommendedItems.length > 0 && (

          <>

            {/* ============================================ */}
            {/* BECAUSE YOU WATCHED */}
            {/* ============================================ */}

            <ContentRow
              title={
                isKids
                  ? "Recommended For You"
                  : becauseYouWatchedTitle
              }
              items={
                recommendedItems
              }
              type="mixed"
              profileId={
                profile.id
              }
              myList={
                myList
              }
              onListChange={
                loadHome
              }
            />


            {/* ============================================ */}
            {/* RECOMMENDED FOR YOU */}
            {/* ============================================ */}

            <ContentRow
              title={
                isKids
                  ? "More Picks For You"
                  : "Recommended For You"
              }
              items={
                recommendedItems
              }
              type="mixed"
              profileId={
                profile.id
              }
              myList={
                myList
              }
              onListChange={
                loadHome
              }
            />

          </>

        )}


        {/* ================================================== */}
        {/* EMPTY RECOMMENDATIONS */}
        {/* ================================================== */}

        {!recommendationLoading &&
          recommendationData &&
          recommendedItems.length === 0 && (

          <section className="recommendations-empty">

            <div>

              <span>
                STREAMFLIX
              </span>


              <h2>
                Discover something new
              </h2>


              <p>
                Keep watching movies and shows
                to get personalized recommendations.
              </p>

            </div>

          </section>

        )}

      </main>

    </div>

  );

};


export default Home;