const IconButton = ({
  children,
  onClick,
  label,
  className = "",
}) => {

  return (

    <button
      type="button"
      className={`icon-button ${className}`}
      onClick={onClick}
      aria-label={label}
      title={label}
    >

      {children}

    </button>

  );

};


export default IconButton;