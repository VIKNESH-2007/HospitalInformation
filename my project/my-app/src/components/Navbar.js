import React from "react";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./Navbar.css";

function Navbar() {
  const navigate = useNavigate();
  const { language, changeLanguage, t } = useLanguage();
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/");
  };

  return (
    <div className="navbar">

      <div className="navbar-left" style={{ display: "flex", alignItems: "center" }}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "12px", flexShrink: 0 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(56, 189, 248, 0.2)" />
          <path d="M12 8v8" strokeWidth="3" />
          <path d="M8 12h8" strokeWidth="3" />
        </svg>
        <h2>
          {t("title")}
        </h2>
      </div>

      <div className="navbar-right">
        <select 
          value={language} 
          onChange={(e) => changeLanguage(e.target.value)} 
          className="navbar-lang-select"
        >
          <option value="en">English</option>
          <option value="hi">हिन्दी (Hindi)</option>
          <option value="ta">தமிழ் (Tamil)</option>
          <option value="te">తెలుగు (Telugu)</option>
          <option value="kn">ಕನ್ನಡ (Kannada)</option>
        </select>
        <span>🔔</span>
        <span className="user-profile-tag">👤 {user.username || "Guest"} ({user.role || "User"})</span>
        <button onClick={handleLogout} className="logout-btn">{t("logout")}</button>
      </div>

    </div>
  );
}

export default Navbar;
