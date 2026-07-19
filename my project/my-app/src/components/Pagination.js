import React from "react";

function Pagination({ currentPage, totalPages }) {

  return (

    <div>

      <button disabled={currentPage === 1}>Previous</button>

      <span>

        {" "}
        Page {currentPage} of {totalPages}{" "}

      </span>

      <button disabled={currentPage === totalPages}>Next</button>

    </div>

  );

}

export default Pagination;