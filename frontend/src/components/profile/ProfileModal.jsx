// import {
//   useEffect,
//   useState,
// } from "react";


// // ============================================================
// // PROFILE MODAL
// // ============================================================

// const ProfileModal = ({
//   profile,
//   onClose,
//   onSave,
//   onDelete,
//   loading,
// }) => {

//   const editing =
//     Boolean(profile);


//   // ==========================================================
//   // FORM STATE
//   // ==========================================================

//   const [
//     formData,
//     setFormData,
//   ] = useState({

//     name: "",

//     language: "en",

//     pin: "",

//     is_kids: false,

//     maturity_level: "18+",

//   });


//   // ==========================================================
//   // PIN VISIBILITY
//   // ==========================================================

//   const [
//     showPin,
//     setShowPin,
//   ] = useState(false);


//   // ==========================================================
//   // ERROR
//   // ==========================================================

//   const [
//     error,
//     setError,
//   ] = useState("");


//   // ==========================================================
//   // INITIAL DATA
//   // ==========================================================

//   useEffect(() => {

//     if (profile) {

//       setFormData({

//         name:
//           profile.name || "",

//         language:
//           profile.language || "en",

//         /*
//          * Backend does NOT return the raw PIN
//          * because pin is write_only.
//          *
//          * Therefore we intentionally keep
//          * the PIN field empty while editing.
//          */
//         pin: "",

//         is_kids:
//           Boolean(
//             profile.is_kids
//           ),

//         maturity_level:
//           profile.maturity_level ||
//           "18+",

//       });

//     } else {

//       setFormData({

//         name: "",

//         language: "en",

//         pin: "",

//         is_kids: false,

//         maturity_level: "18+",

//       });

//     }


//     setError("");

//     setShowPin(false);

//   }, [profile]);


//   // ==========================================================
//   // INPUT CHANGE
//   // ==========================================================

//   const handleChange = (
//     event
//   ) => {

//     const {
//       name,
//       value,
//       checked,
//       type,
//     } = event.target;


//     // --------------------------------------------------------
//     // PIN
//     // --------------------------------------------------------

//     if (name === "pin") {

//       /*
//        * PIN must contain numbers only.
//        * Backend accepts maximum 4 digits.
//        */

//       const numericPin =
//         value
//           .replace(/\D/g, "")
//           .slice(0, 4);


//       setFormData(
//         previous => ({

//           ...previous,

//           pin: numericPin,

//         })
//       );


//       setError("");

//       return;
//     }


//     // --------------------------------------------------------
//     // NORMAL INPUTS
//     // --------------------------------------------------------

//     setFormData(
//       previous => ({

//         ...previous,

//         [name]:
//           type === "checkbox"
//             ? checked
//             : value,

//       })
//     );


//     setError("");

//   };


//   // ==========================================================
//   // SAVE
//   // ==========================================================

//   const handleSubmit = async (
//     event
//   ) => {

//     event.preventDefault();


//     // --------------------------------------------------------
//     // PROFILE NAME
//     // --------------------------------------------------------

//     const cleanName =
//       formData.name.trim();


//     if (!cleanName) {

//       setError(
//         "Profile name is required."
//       );

//       return;

//     }


//     // --------------------------------------------------------
//     // PIN VALIDATION
//     // --------------------------------------------------------

//     if (
//       formData.pin &&
//       formData.pin.length !== 4
//     ) {

//       setError(
//         "Profile PIN must be exactly 4 digits."
//       );

//       return;

//     }


//     // --------------------------------------------------------
//     // PAYLOAD
//     // --------------------------------------------------------

//     const payload = {

//       name: cleanName,

//       language:
//         formData.language,

//       is_kids:
//         formData.is_kids,

//       maturity_level:
//         formData.is_kids
//           ? "7+"
//           : formData.maturity_level,

//     };


//     /*
//      * Only send PIN when user actually entered one.
//      *
//      * This is especially important during EDIT.
//      * Because backend's PIN is write_only,
//      * the existing hashed PIN is never returned.
//      */

//     if (formData.pin) {

//       payload.pin =
//         formData.pin;

//     }


//     // --------------------------------------------------------
//     // SAVE
//     // --------------------------------------------------------

//     try {

//       await onSave(
//         payload
//       );

//     } catch (error) {

//       const responseData =
//         error.response?.data;


//       let message =
//         "Unable to save profile.";


//       if (
//         responseData?.detail
//       ) {

//         message =
//           responseData.detail;

//       } else if (
//         responseData?.message
//       ) {

//         message =
//           responseData.message;

//       } else if (
//         responseData &&
//         typeof responseData === "object"
//       ) {

//         const messages =
//           Object.values(
//             responseData
//           )
//             .flat()
//             .filter(Boolean);


//         if (
//           messages.length
//         ) {

//           message =
//             messages.join(" ");

//         }

//       }


//       setError(
//         message
//       );

//     }

//   };


//   // ==========================================================
//   // DELETE
//   // ==========================================================

//   const handleDelete = async () => {

//     if (!profile) {

//       return;

//     }


//     const confirmed =
//       window.confirm(
//         `Are you sure you want to delete "${profile.name}"?`
//       );


//     if (!confirmed) {

//       return;

//     }


//     try {

//       await onDelete(
//         profile.id
//       );

//       onClose();

//     } catch (error) {

//       const responseData =
//         error.response?.data;


//       const message =
//         responseData?.detail ||
//         responseData?.message ||
//         "Unable to delete profile.";


//       setError(
//         message
//       );

//     }

//   };


//   // ==========================================================
//   // RENDER
//   // ==========================================================

//   return (

//     <div
//       className="profile-modal-backdrop"
//       onMouseDown={(event) => {

//         if (
//           event.target ===
//           event.currentTarget
//         ) {

//           onClose();

//         }

//       }}
//     >

//       <div
//         className="profile-modal"
//         role="dialog"
//         aria-modal="true"
//         aria-label={
//           editing
//             ? "Edit Profile"
//             : "Add Profile"
//         }
//       >

//         {/* ================================================== */}
//         {/* HEADER */}
//         {/* ================================================== */}

//         <div className="profile-modal-header">

//           <div>

//             <h2>

//               {editing
//                 ? "Edit Profile"
//                 : "Add Profile"
//               }

//             </h2>


//             <p>

//               {editing
//                 ? "Update your viewing preferences."
//                 : "Create a new viewing profile."
//               }

//             </p>

//           </div>


//           <button
//             type="button"
//             className="profile-modal-close"
//             onClick={onClose}
//             disabled={loading}
//             aria-label="Close"
//           >

//             ×

//           </button>

//         </div>


//         {/* ================================================== */}
//         {/* ERROR */}
//         {/* ================================================== */}

//         {error && (

//           <div
//             className="profile-modal-error"
//             role="alert"
//           >

//             {error}

//           </div>

//         )}


//         {/* ================================================== */}
//         {/* FORM */}
//         {/* ================================================== */}

//         <form
//           className="profile-form"
//           onSubmit={handleSubmit}
//         >

//           {/* ================================================= */}
//           {/* NAME */}
//           {/* ================================================= */}

//           <div className="profile-form-field">

//             <label
//               htmlFor="profile-name"
//             >
//               Profile Name
//             </label>


//             <input
//               id="profile-name"
//               name="name"
//               type="text"
//               value={formData.name}
//               onChange={handleChange}
//               placeholder="Enter profile name"
//               maxLength={50}
//               disabled={loading}
//               autoFocus
//               required
//             />

//           </div>


//           {/* ================================================= */}
//           {/* LANGUAGE */}
//           {/* ================================================= */}

//           <div className="profile-form-field">

//             <label
//               htmlFor="profile-language"
//             >
//               Language
//             </label>


//             <select
//               id="profile-language"
//               name="language"
//               value={formData.language}
//               onChange={handleChange}
//               disabled={loading}
//             >

//               <option value="en">
//                 English
//               </option>

//               <option value="ur">
//                 Urdu
//               </option>

//               <option value="hi">
//                 Hindi
//               </option>

//               <option value="es">
//                 Spanish
//               </option>

//               <option value="fr">
//                 French
//               </option>

//               <option value="ar">
//                 Arabic
//               </option>

//             </select>

//           </div>


//           {/* ================================================= */}
//           {/* MATURITY */}
//           {/* ================================================= */}

//           <div className="profile-form-field">

//             <label
//               htmlFor="profile-maturity"
//             >
//               Maturity Level
//             </label>


//             <select
//               id="profile-maturity"
//               name="maturity_level"
//               value={
//                 formData.is_kids
//                   ? "7+"
//                   : formData.maturity_level
//               }
//               onChange={handleChange}
//               disabled={
//                 loading ||
//                 formData.is_kids
//               }
//             >

//               <option value="all">
//                 All
//               </option>

//               <option value="7+">
//                 7+
//               </option>

//               <option value="13+">
//                 13+
//               </option>

//               <option value="16+">
//                 16+
//               </option>

//               <option value="18+">
//                 18+
//               </option>

//             </select>

//           </div>


//           {/* ================================================= */}
//           {/* PIN */}
//           {/* ================================================= */}

//           <div className="profile-form-field">

//             <label
//               htmlFor="profile-pin"
//             >
//               Profile PIN
//             </label>


//             <div className="profile-pin-container">

//               <input
//                 id="profile-pin"
//                 name="pin"
//                 type={
//                   showPin
//                     ? "text"
//                     : "password"
//                 }
//                 value={formData.pin}
//                 onChange={handleChange}
//                 placeholder={
//                   editing
//                     ? "Enter new 4-digit PIN"
//                     : "Optional 4-digit PIN"
//                 }
//                 inputMode="numeric"
//                 autoComplete="off"
//                 maxLength={4}
//                 disabled={loading}
//               />


//               <button
//                 type="button"
//                 className="profile-pin-button"
//                 onClick={() =>
//                   setShowPin(
//                     previous =>
//                       !previous
//                   )
//                 }
//                 disabled={loading}
//               >

//                 {showPin
//                   ? "Hide"
//                   : "Show"
//                 }

//               </button>

//             </div>

//           </div>


//           {/* ================================================= */}
//           {/* KIDS */}
//           {/* ================================================= */}

//           <label
//             className="profile-kids-option"
//           >

//             <input
//               type="checkbox"
//               name="is_kids"
//               checked={
//                 formData.is_kids
//               }
//               onChange={handleChange}
//               disabled={loading}
//             />


//             <span>

//               <strong>
//                 Kids Profile
//               </strong>

//               <small>
//                 Only show age-appropriate content.
//               </small>

//             </span>

//           </label>


//           {/* ================================================= */}
//           {/* ACTIONS */}
//           {/* ================================================= */}

//           <div className="profile-modal-actions">

//             {editing && (

//               <button
//                 type="button"
//                 className="profile-delete-button"
//                 onClick={handleDelete}
//                 disabled={loading}
//               >

//                 Delete

//               </button>

//             )}


//             <div className="profile-modal-main-actions">

//               <button
//                 type="button"
//                 className="profile-cancel-button"
//                 onClick={onClose}
//                 disabled={loading}
//               >

//                 Cancel

//               </button>


//               <button
//                 type="submit"
//                 className="profile-save-button"
//                 disabled={loading}
//               >

//                 {loading
//                   ? "Saving..."
//                   : editing
//                     ? "Save Changes"
//                     : "Create Profile"
//                 }

//               </button>

//             </div>

//           </div>

//         </form>

//       </div>

//     </div>

//   );

// };


// export default ProfileModal;






import {
  useEffect,
  useState,
} from "react";


const ProfileModal = ({
  profile,
  onClose,
  onSave,
  onDelete,
  loading,
}) => {

  const editing =
    Boolean(profile);


  const [
    formData,
    setFormData,
  ] = useState({

    name: "",

    language: "en",

    pin: "",

    is_kids: false,

    maturity_level: "18+",

  });


  const [
    showPin,
    setShowPin,
  ] = useState(false);


  const [
    error,
    setError,
  ] = useState("");


  // ==========================================================
  // INITIAL DATA
  // ==========================================================

  useEffect(() => {

    if (profile) {

      setFormData({

        name:
          profile.name || "",

        language:
          profile.language || "en",

        pin: "",

        is_kids:
          Boolean(
            profile.is_kids
          ),

        maturity_level:
          profile.maturity_level ||
          "18+",

      });

    } else {

      setFormData({

        name: "",

        language: "en",

        pin: "",

        is_kids: false,

        maturity_level: "18+",

      });

    }


    setError("");

  }, [profile]);


  // ==========================================================
  // INPUT
  // ==========================================================

  const handleChange = (
    event
  ) => {

    const {
      name,
      value,
      checked,
      type,
    } = event.target;


    setFormData(
      previous => ({

        ...previous,

        [name]:
          type === "checkbox"
            ? checked
            : value,

      })
    );


    setError("");

  };


  // ==========================================================
  // SUBMIT
  // ==========================================================

  const handleSubmit = async (
    event
  ) => {

    event.preventDefault();


    const cleanName =
      formData.name.trim();


    if (!cleanName) {

      setError(
        "Profile name is required."
      );

      return;

    }


    if (
      formData.pin &&
      !/^\d{4}$/.test(
        formData.pin
      )
    ) {

      setError(
        "PIN must contain exactly 4 numbers."
      );

      return;

    }


    const payload = {

      ...formData,

      name:
        cleanName,

      maturity_level:
        formData.is_kids
          ? "7+"
          : formData.maturity_level,

    };


    try {

      await onSave(
        payload
      );


    } catch (error) {

      const message =
        error.response?.data?.detail ||
        error.response?.data?.message ||
        "Unable to save profile.";


      setError(
        message
      );

    }

  };


  // ==========================================================
  // DELETE
  // ==========================================================

  const handleDelete =
    async () => {

      if (!profile) {

        return;

      }


      const confirmed =
        window.confirm(
          `Are you sure you want to delete "${profile.name}"?`
        );


      if (!confirmed) {

        return;

      }


      try {

        await onDelete(
          profile.id
        );


        onClose();


      } catch (error) {

        const message =
          error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to delete profile.";


        setError(
          message
        );

      }

    };


  return (

    <div
      className="profile-modal-backdrop"
      onMouseDown={(event) => {

        if (
          event.target ===
          event.currentTarget
        ) {

          onClose();

        }

      }}
    >

      <div
        className="profile-modal"
        role="dialog"
        aria-modal="true"
      >

        {/* ================================================= */}
        {/* HEADER */}
        {/* ================================================= */}

        <div className="profile-modal-header">

          <div>

            <h2>

              {editing
                ? "Edit Profile"
                : "Add Profile"
              }

            </h2>


            <p>

              {editing
                ? "Update your viewing preferences."
                : "Create a new viewing profile."
              }

            </p>

          </div>


          <button
            type="button"
            className="profile-modal-close"
            onClick={onClose}
            disabled={loading}
          >
            ×
          </button>

        </div>


        {/* ================================================= */}
        {/* ERROR */}
        {/* ================================================= */}

        {error && (

          <div
            className="profile-modal-error"
            role="alert"
          >
            {error}
          </div>

        )}


        {/* ================================================= */}
        {/* FORM */}
        {/* ================================================= */}

        <form
          className="profile-form"
          onSubmit={handleSubmit}
        >

          {/* NAME */}

          <div className="profile-form-field">

            <label htmlFor="profile-name">
              Profile Name
            </label>


            <input
              id="profile-name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter profile name"
              maxLength={50}
              disabled={loading}
              autoFocus
            />

          </div>


          {/* LANGUAGE */}

          <div className="profile-form-field">

            <label htmlFor="profile-language">
              Language
            </label>


            <select
              id="profile-language"
              name="language"
              value={formData.language}
              onChange={handleChange}
              disabled={loading}
            >

              <option value="en">
                English
              </option>

              <option value="ur">
                Urdu
              </option>

              <option value="hi">
                Hindi
              </option>

              <option value="es">
                Spanish
              </option>

              <option value="fr">
                French
              </option>

              <option value="ar">
                Arabic
              </option>

            </select>

          </div>


          {/* MATURITY */}

          <div className="profile-form-field">

            <label htmlFor="profile-maturity">
              Maturity Level
            </label>


            <select
              id="profile-maturity"
              name="maturity_level"
              value={
                formData.is_kids
                  ? "7+"
                  : formData.maturity_level
              }
              onChange={handleChange}
              disabled={
                loading ||
                formData.is_kids
              }
            >

              <option value="all">
                All
              </option>

              <option value="7+">
                7+
              </option>

              <option value="13+">
                13+
              </option>

              <option value="16+">
                16+
              </option>

              <option value="18+">
                18+
              </option>

            </select>

          </div>


          {/* PIN */}

          <div className="profile-form-field">

            <label htmlFor="profile-pin">
              Profile PIN
            </label>


            <div className="profile-pin-container">

              <input
                id="profile-pin"
                name="pin"
                type={
                  showPin
                    ? "text"
                    : "password"
                }
                value={formData.pin}
                onChange={handleChange}
                placeholder="Optional 4-digit PIN"
                maxLength={4}
                inputMode="numeric"
                pattern="[0-9]{4}"
                disabled={loading}
              />


              <button
                type="button"
                className="profile-pin-button"
                onClick={() =>
                  setShowPin(
                    previous =>
                      !previous
                  )
                }
              >

                {showPin
                  ? "Hide"
                  : "Show"
                }

              </button>

            </div>

          </div>


          {/* ================================================= */}
          {/* KIDS */}
          {/* ================================================= */}

          <label
            className={
              formData.is_kids
                ? "profile-kids-option active"
                : "profile-kids-option"
            }
          >

            <input
              type="checkbox"
              name="is_kids"
              checked={
                formData.is_kids
              }
              onChange={handleChange}
              disabled={loading}
            />


            <span>

              <strong>
                Kids Profile
              </strong>

              <small>
                Only show age-appropriate content.
              </small>

            </span>

          </label>


          {/* ================================================= */}
          {/* ACTIONS */}
          {/* ================================================= */}

          <div className="profile-modal-actions">

            {editing && (

              <button
                type="button"
                className="profile-delete-button"
                onClick={handleDelete}
                disabled={loading}
              >
                Delete
              </button>

            )}


            <div className="profile-modal-main-actions">

              <button
                type="button"
                className="profile-cancel-button"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </button>


              <button
                type="submit"
                className="profile-save-button"
                disabled={loading}
              >

                {loading
                  ? "Saving..."
                  : editing
                    ? "Save Changes"
                    : "Create Profile"
                }

              </button>

            </div>

          </div>

        </form>

      </div>

    </div>

  );

};


export default ProfileModal;