import React from "react";
import { useNavigate } from "react-router-dom";
import "./Unauthorized.css";

const Unauthorized = () => {
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    navigate("/home");
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
          </svg>
        </div>
        <h1 className="unauthorized-title">403 - Access Denied</h1>
        <p className="unauthorized-message">
          You do not have the required permissions to access this page. Please
          contact your administrator if you believe this is an error.
        </p>
        <div className="unauthorized-actions">
          <button className="unauthorized-btn secondary" onClick={handleGoBack}>
            Go Back
          </button>
          <button className="unauthorized-btn primary" onClick={handleGoHome}>
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Unauthorized;
