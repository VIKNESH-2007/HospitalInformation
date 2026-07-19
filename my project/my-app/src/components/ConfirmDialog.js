import React from "react";
import "./ConfirmDialog.css";


function ConfirmDialog({ message }) {

  return (

    <div>

      <h3>{message}</h3>

      <button>Yes</button>

      <button>No</button>

    </div>

  );

}

export default ConfirmDialog;