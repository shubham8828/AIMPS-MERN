import React from "react";
import './Spinner.css'
const Spinner = () => {
  return (
    <div className="spinner-container">
      <div className="spinner-overlay">
        <div className="spinner"></div>
      </div>
    </div>
  );
};

export default Spinner;
