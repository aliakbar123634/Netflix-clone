const AddProfileCard = ({
  onClick,
}) => {

  return (

    <button
      type="button"
      className="add-profile-card"
      onClick={onClick}
    >

      <div className="add-profile-avatar">

        <span>
          +
        </span>

      </div>


      <div className="add-profile-name">

        Add Profile

      </div>

    </button>

  );

};


export default AddProfileCard;