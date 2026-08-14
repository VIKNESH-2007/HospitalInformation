import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Home.css";

function Home() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState("Patient");
  const [userRole, setUserRole] = useState("User");
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    // Read user from localStorage
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user.fullName) setUserName(user.fullName);
        if (user.role) setUserRole(user.role);
      } catch (e) {
        console.error("Error loading user details", e);
      }
    }

    // Set interactive date-time greeting
    const updateTime = () => {
      const now = new Date();
      const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
      setCurrentTime(now.toLocaleDateString(undefined, options));
    };
    updateTime();
  }, []);

  return (
    <div className="home-dashboard">
      {/* Hero Welcome Header */}
      <div className="hero-banner">
        <div className="hero-content">
          <span className="badge">{userRole} Command Portal</span>
          <h1>Welcome back, {userName}</h1>
          <p className="subtitle">
            Access your comprehensive medical dashboard, schedule appointments, review prescription history, and track clinical queues from a single unified portal.
          </p>
          <p className="current-date">{currentTime}</p>
        </div>
        <div className="hero-decoration">
          <div className="pulse-circle"></div>
          <div className="floating-card">
            <span className="icon">🏥</span>
            <div>
              <h4>NovaCare Live</h4>
              <p>All services fully operational</p>
            </div>
          </div>
        </div>
      </div>

      {/* Metric Quick Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card blue-gradient" onClick={() => navigate("/appointments")}>
          <div className="stat-icon">📅</div>
          <div className="stat-info">
            <h3>My Appointments</h3>
            <p>Schedule and track consults</p>
            <span className="action-link">Manage &rarr;</span>
          </div>
        </div>

        <div className="stat-card green-gradient" onClick={() => navigate("/medical-records")}>
          <div className="stat-icon">📁</div>
          <div className="stat-info">
            <h3>Medical Records</h3>
            <p>View prescription history & reports</p>
            <span className="action-link">View Files &rarr;</span>
          </div>
        </div>

        <div className="stat-card purple-gradient" onClick={() => navigate("/doctors")}>
          <div className="stat-icon">👨‍⚕️</div>
          <div className="stat-info">
            <h3>Consult Doctors</h3>
            <p>Find speciality specialists</p>
            <span className="action-link">Search &rarr;</span>
          </div>
        </div>

        <div className="stat-card orange-gradient" onClick={() => navigate("/treatments")}>
          <div className="stat-icon">⚡</div>
          <div className="stat-info">
            <h3>Treatments Queue</h3>
            <p>Live procedure delay updates</p>
            <span className="action-link">Check Status &rarr;</span>
          </div>
        </div>
      </div>

      {/* Main Features Segment */}
      <div className="dashboard-sections">
        {/* Speciality Care Center */}
        <div className="panel speciality-panel">
          <h2>NovaCare Speciality Care Centers</h2>
          <p className="panel-desc">We offer advanced diagnosis and care across key medical disciplines</p>
          
          <div className="specialities-list">
            <div className="spec-item">
              <span className="spec-icon">❤️</span>
              <div>
                <h4>Cardiology Department</h4>
                <p>Advanced cardiac diagnostics & cardiac catheterization labs.</p>
              </div>
            </div>
            
            <div className="spec-item">
              <span className="spec-icon">🧠</span>
              <div>
                <h4>Neurology Department</h4>
                <p>Neurodegenerative disorders, stroke care, and MRI diagnostic services.</p>
              </div>
            </div>

            <div className="spec-item">
              <span className="spec-icon">🦴</span>
              <div>
                <h4>Orthopedics Department</h4>
                <p>Joint replacements, trauma, and comprehensive physiotherapy rehabilitation.</p>
              </div>
            </div>
          </div>
        </div>

        {/* Live Operational Updates */}
        <div className="panel updates-panel">
          <h2>Live Facility Announcements</h2>
          <p className="panel-desc">Real-time status updates from our central operational network</p>

          <div className="updates-list">
            <div className="update-item alert-info">
              <span className="update-bullet"></span>
              <div>
                <strong>Op-Room 3 Maintenance Complete</strong>
                <span className="time">Just now</span>
                <p>Sterilization workflow finalized. Operational queues are proceeding normally.</p>
              </div>
            </div>

            <div className="update-item alert-success">
              <span className="update-bullet"></span>
              <div>
                <strong>New Specialist Onboarded</strong>
                <span className="time">2 hours ago</span>
                <p>Dr. James Carter joins the Orthopedics department. Booking slots now open.</p>
              </div>
            </div>

            <div className="update-item alert-warning">
              <span className="update-bullet"></span>
              <div>
                <strong>Pharmacy Inventory Restocked</strong>
                <span className="time">Today</span>
                <p>Life-saving medications and cardiac therapeutics inventory updated.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Footer */}
      <div className="quick-actions-bar">
        <h3>Need Immediate Assistance?</h3>
        <div className="action-buttons">
          <button className="btn-primary" onClick={() => navigate("/profile")}>Update Profile Info</button>
          <a href="tel:+123456789" className="btn-secondary">Emergency Hotline: +123 456 789</a>
        </div>
      </div>
    </div>
  );
}

export default Home;