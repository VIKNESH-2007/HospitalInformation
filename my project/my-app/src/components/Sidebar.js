import React from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import "./Sidebar.css";

function Sidebar() {
  const { t } = useLanguage();
  const userString = localStorage.getItem("user");
  let isAdmin = false;
  let isStaff = false;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      const role = ((user && user.role) || "").toLowerCase();
      isAdmin = role === "admin";
      isStaff = role === "staff";
    } catch (e) {
      console.error("Error parsing user role for Sidebar:", e);
    }
  }

  return (
    <div className="sidebar">

      <div className="sidebar-header" style={{ display: "flex", alignItems: "center", padding: "20px 15px", borderBottom: "1px solid rgba(255, 255, 255, 0.1)" }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: "10px", flexShrink: 0 }}>
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" fill="rgba(56, 189, 248, 0.2)" />
          <path d="M12 8v8" strokeWidth="3" />
          <path d="M8 12h8" strokeWidth="3" />
        </svg>
        <h2 style={{ fontSize: "1.2rem", fontWeight: "bold", margin: 0, color: "#ffffff", letterSpacing: "0.5px" }}>NovaCare</h2>
      </div>

      <ul className="sidebar-menu">

        <li>
          <Link to="/dashboard">📊 {t("dashboard")}</Link>
        </li>

        <li>
          <Link to="/patients">🧑 {t("patients")}</Link>
        </li>

        <li>
          <Link to="/doctors">👨‍⚕️ {t("doctors")}</Link>
        </li>

        <li>
          <Link to="/appointments">📅 {t("appointments")}</Link>
        </li>

        <li>
          <Link to="/treatments">⏱️ Treatments</Link>
        </li>

        {(isAdmin || isStaff) && (
          <li>
            <Link to="/resources">📊 Resources</Link>
          </li>
        )}

        {isAdmin && (
          <li>
            <Link to="/billing">💳 {t("billing")}</Link>
          </li>
        )}

        <li>
          <Link to="/pharmacy">💊 {t("pharmacy")}</Link>
        </li>

        <li>
          <Link to="/laboratory">🧪 {t("laboratory")}</Link>
        </li>

        {isAdmin && (
          <li>
            <Link to="/reports">📈 {t("reports")}</Link>
          </li>
        )}

        {isAdmin && (
          <li>
            <Link to="/staff">👥 {t("staff")}</Link>
          </li>
        )}

        {isAdmin && (
          <li>
            <Link to="/settings">⚙ {t("settings")}</Link>
          </li>
        )}

      </ul>

    </div>
  );
}

export default Sidebar;