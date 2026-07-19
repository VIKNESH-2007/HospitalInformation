import React, { useState } from "react";
import "./Profile.css";

function Profile() {
  const [editing, setEditing] = useState(false);

  const userString = localStorage.getItem("user");
  let currentUser = {
    name: "Demo User",
    email: "user@hospital.com",
    role: "Staff Member",
    username: "user"
  };

  if (userString) {
    try {
      const parsed = JSON.parse(userString);
      currentUser = {
        name: parsed.fullName || parsed.username || "User",
        email: parsed.email || "user@hospital.com",
        role: parsed.role || "User",
        username: parsed.username || "user"
      };
    } catch (e) {
      console.error("Error parsing user role for Profile:", e);
    }
  }

  const [profile, setProfile] = useState(currentUser);
  
  // Custom Profile Avatar State using Local Storage to persist local image upload
  const avatarStorageKey = `user_avatar_${profile.username}`;
  const [avatar, setAvatar] = useState(localStorage.getItem(avatarStorageKey) || "");

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64Data = reader.result;
        setAvatar(base64Data);
        localStorage.setItem(avatarStorageKey, base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChange = (e) => {
    setProfile({
      ...profile,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = () => {
    setEditing(false);
    alert("Profile Updated Successfully!");
  };

  const isPatient = (profile.role || "").toLowerCase() === "user" || (profile.role || "").toLowerCase() === "patient";

  return (
    <div className="profile-page-wrapper">
      <div className="profile-card-premium">
        
        {/* Profile Card Header */}
        <div className="profile-header-banner">
          <div className="avatar-glowing-wrapper">
            <div 
              className="profile-avatar-premium" 
              onClick={() => document.getElementById("avatar-file-input").click()}
              title="Click to change profile picture"
            >
              {avatar ? (
                <img src={avatar} alt="Avatar" className="profile-avatar-img" />
              ) : (
                profile.name.charAt(0).toUpperCase()
              )}
              <div className="avatar-camera-overlay">📷</div>
            </div>
            
            <input 
              type="file" 
              id="avatar-file-input" 
              accept="image/*" 
              onChange={handleAvatarChange} 
              style={{ display: "none" }} 
            />
            
            <span className="online-indicator"></span>
          </div>
          <div className="profile-identity">
            <h2>{profile.name}</h2>
            <p className="profile-role-badge">{profile.role}</p>
          </div>
        </div>

        {/* Profile Inner Grid */}
        <div className="profile-content-grid">
          
          {/* Section 1: Account Details */}
          <div className="profile-info-section">
            <div className="section-title-wrapper">
              <span className="title-icon">👤</span>
              <h3>Account Details</h3>
            </div>
            
            {editing ? (
              <div className="edit-form-inputs">
                <div className="profile-input-item">
                  <label>Full Name</label>
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-input-item">
                  <label>Email Address</label>
                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleChange}
                  />
                </div>
              </div>
            ) : (
              <div className="details-read-only">
                <div className="info-detail-row">
                  <span className="row-label">Username</span>
                  <span className="row-val">{profile.username}</span>
                </div>
                <div className="info-detail-row">
                  <span className="row-label">Full Name</span>
                  <span className="row-val">{profile.name}</span>
                </div>
                <div className="info-detail-row">
                  <span className="row-label">Email</span>
                  <span className="row-val">{profile.email}</span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Clinical Details (dynamic based on role) */}
          <div className="profile-info-section accent-section">
            {isPatient ? (
              <>
                <div className="section-title-wrapper">
                  <span className="title-icon">🩺</span>
                  <h3>Patient Medical Summary</h3>
                </div>
                <div className="details-read-only">
                  <div className="info-detail-row">
                    <span className="row-label">Patient ID</span>
                    <span className="row-val code-style">P-1092</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">Blood Type</span>
                    <span className="row-val blood-type-badge">O+</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">Allergies</span>
                    <span className="row-val allergy-tag">Penicillin</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">Primary Care</span>
                    <span className="row-val text-accent-glow">Dr. Robert Chen</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">File Status</span>
                    <span className="row-val file-status-active">Active Care File</span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="section-title-wrapper">
                  <span className="title-icon">💼</span>
                  <h3>Clinical Operations Roster</h3>
                </div>
                <div className="details-read-only">
                  <div className="info-detail-row">
                    <span className="row-label">Roster Code</span>
                    <span className="row-val code-style">ST-204</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">Access Clearance</span>
                    <span className="row-val security-badge">Standard Operations</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">Current Shift</span>
                    <span className="row-val">Day Roster (9AM - 5PM)</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">On-Call Status</span>
                    <span className="row-val text-accent-glow">High Priority</span>
                  </div>
                  <div className="info-detail-row">
                    <span className="row-label">Clinical Scope</span>
                    <span className="row-val">Inpatient Wards & Diagnostics</span>
                  </div>
                </div>
              </>
            )}
          </div>

        </div>

        {/* Action Button Footer */}
        <div className="profile-actions-footer">
          {editing ? (
            <>
              <button onClick={handleSave} className="profile-btn save-btn">
                Save Changes ✓
              </button>
              <button onClick={() => setEditing(false)} className="profile-btn cancel-btn">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setEditing(true)} className="profile-btn edit-btn">
              Edit Account Info ✏️
            </button>
          )}
        </div>

      </div>
    </div>
  );
}

export default Profile;