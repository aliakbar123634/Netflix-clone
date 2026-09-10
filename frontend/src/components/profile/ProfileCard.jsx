// import {
//   useState,
// } from "react";


// const ProfileCard = ({
//   profile,
//   onSelect,
//   editMode,
// }) => {

//   const [
//     imageError,
//     setImageError,
//   ] = useState(false);


//   const name =
//     profile?.name ||
//     "Profile";


//   const avatar =
//     profile?.avatar;


//   const isKids =
//     Boolean(
//       profile?.is_kids
//     );


//   const handleClick = () => {

//     onSelect(
//       profile
//     );

//   };


//   return (

//     <button
//       type="button"
//       className={`profile-card ${
//         editMode
//           ? "profile-card-managing"
//           : ""
//       }`}
//       onClick={handleClick}
//     >

//       <div className="profile-avatar">

//         {avatar && !imageError ? (

//           <img
//             src={avatar}
//             alt={name}
//             onError={() =>
//               setImageError(true)
//             }
//           />

//         ) : (

//           <div className="profile-avatar-fallback">

//             {name
//               .charAt(0)
//               .toUpperCase()
//             }

//           </div>

//         )}


//         {editMode && (

//           <div className="profile-edit-layer">

//             <span className="profile-edit-icon">
//               ✎
//             </span>

//           </div>

//         )}

//       </div>


//       <div className="profile-name">

//         {name}

//       </div>


//       {isKids && (

//         <span className="profile-kids-badge">
//           KIDS
//         </span>

//       )}

//     </button>

//   );

// };


// export default ProfileCard;


const ProfileCard = ({
  profile,
  onSelect,
  editMode = false,
}) => {

  const avatar =
    profile?.avatar_url ||
    profile?.avatar;


  const initial =
    profile?.name
      ?.charAt(0)
      ?.toUpperCase() ||
    "P";


  const handleClick = () => {

    onSelect(
      profile
    );

  };


  return (

    <button
      type="button"
      className={
        editMode
          ? "profile-card profile-card-managing"
          : "profile-card"
      }
      onClick={
        handleClick
      }
    >

      {/* ==================================================== */}
      {/* AVATAR */}
      {/* ==================================================== */}

      <div className="profile-avatar">

        {avatar ? (

          <img
            src={avatar}
            alt={profile.name}
          />

        ) : (

          <div className="profile-avatar-fallback">

            {profile.is_kids
              ? "★"
              : initial
            }

          </div>

        )}


        {/* ================================================== */}
        {/* EDIT OVERLAY */}
        {/* ================================================== */}

        {editMode && (

          <div className="profile-edit-layer">

            <span className="profile-edit-icon">
              ✎
            </span>

          </div>

        )}

      </div>


      {/* ==================================================== */}
      {/* NAME */}
      {/* ==================================================== */}

      <div className="profile-name">

        {profile.name}

      </div>


      {/* ==================================================== */}
      {/* KIDS BADGE */}
      {/* ==================================================== */}

      {profile.is_kids && (

        <div className="profile-kids-badge">
          KIDS
        </div>

      )}

    </button>

  );

};


export default ProfileCard;