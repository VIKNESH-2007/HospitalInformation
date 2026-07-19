import React, { useState } from "react";
import "./SystemSettings.css";

function Settings() {

  const [hospitalName, setHospitalName] =
    useState("City Care Hospital");

  const [darkMode, setDarkMode] =
    useState(false);

  const [notifications, setNotifications] =
    useState(true);

  const [autoBackup, setAutoBackup] =
    useState(true);

  const [themeColor, setThemeColor] =
    useState("#1976d2");

  const saveSettings = () => {
    alert("Settings Saved Successfully");
  };

  const backupDatabase = () => {
    alert("Database Backup Created Successfully");
  };

  const exportData = () => {
    alert("Hospital Data Exported Successfully");
  };

  return (
    <div className="settings-page">

      <div className="settings-overlay"></div>

      <div className="settings-container">

        <h1 className="settings-title">
          ⚙️ System Settings
        </h1>

        <div className="settings-card">

          <div className="setting-item">
            <label>Hospital Name</label>

            <input
              type="text"
              value={hospitalName}
              onChange={(e) =>
                setHospitalName(e.target.value)
              }
            />
          </div>

          <div className="setting-item">
            <label>Theme Color</label>

            <input
              type="color"
              value={themeColor}
              onChange={(e) =>
                setThemeColor(e.target.value)
              }
            />
          </div>

          <div className="setting-toggle">

            <span>Enable Dark Mode</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={darkMode}
                onChange={() =>
                  setDarkMode(!darkMode)
                }
              />
              <span className="slider"></span>
            </label>

          </div>

          <div className="setting-toggle">

            <span>Enable Notifications</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={notifications}
                onChange={() =>
                  setNotifications(
                    !notifications
                  )
                }
              />
              <span className="slider"></span>
            </label>

          </div>

          <div className="setting-toggle">

            <span>Automatic Backup</span>

            <label className="switch">
              <input
                type="checkbox"
                checked={autoBackup}
                onChange={() =>
                  setAutoBackup(
                    !autoBackup
                  )
                }
              />
              <span className="slider"></span>
            </label>

          </div>

          <div className="button-group">

            <button
              className="backup-btn"
              onClick={backupDatabase}
            >
              Backup Database
            </button>

            <button
              className="export-btn"
              onClick={exportData}
            >
              Export Data
            </button>

            <button
              className="save-btn"
              onClick={saveSettings}
            >
              Save Settings
            </button>

          </div>

        </div>

      </div>

    </div>
  );
}

export default Settings;