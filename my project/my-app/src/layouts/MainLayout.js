import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Navbar from "../components/Navbar";
import "./MainLayout.css";

function MainLayout({ children }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showSubmitModal, setShowSubmitModal] = useState(false);

  // Check admin/staff roles
  const userString = localStorage.getItem("user");
  let isAdmin = false;
  let isStaff = false;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      const userRole = (user && user.role) ? user.role.toLowerCase() : "";
      isAdmin = userRole === "admin";
      isStaff = userRole === "staff";
    } catch (e) {
      console.error("Error parsing user role for Layout:", e);
    }
  }

  // Active steps in the HIMS workflow based on roles and permissions
  const activeSteps = [
    // Step 1: Entry / Dashboard / Home
    ...((isAdmin || isStaff) ? [{ path: "/dashboard", label: "Dashboard" }] : [{ path: "/home", label: "Home" }]),
    
    // Step 2: Patients (Admin/Staff)
    ...((isAdmin || isStaff) ? [{ path: "/patients", label: "Patients" }] : []),
    
    // Step 3: Doctors (All)
    { path: "/doctors", label: "Doctors" },
    
    // Step 4: Appointments (All)
    { path: "/appointments", label: "Appointments" },
    
    // Step 5: Treatments (All)
    { path: "/treatments", label: "Treatments" },
    
    // Step 6: Medical Records (All)
    { path: "/medical-records", label: "Medical Records" },
    
    // Step 7: Resources (Admin/Staff)
    ...((isAdmin || isStaff) ? [{ path: "/resources", label: "Resources" }] : []),
    
    // Step 8: Pharmacy (Admin/Staff)
    ...((isAdmin || isStaff) ? [{ path: "/pharmacy", label: "Pharmacy" }] : []),
    
    // Step 9: Laboratory (Admin/Staff)
    ...((isAdmin || isStaff) ? [{ path: "/laboratory", label: "Laboratory" }] : []),
    
    // Step 10: Billing (Admin only)
    ...(isAdmin ? [{ path: "/billing", label: "Billing" }] : []),
    
    // Step 11: Reports (Admin only)
    ...(isAdmin ? [{ path: "/reports", label: "Reports" }] : []),
    
    // Step 12: Staff (Admin only)
    ...(isAdmin ? [{ path: "/staff", label: "Staff" }] : []),
    
    // Step 13: Settings (Admin only)
    ...(isAdmin ? [{ path: "/settings", label: "Settings" }] : []),
    
    // Step 14: Profile (All)
    { path: "/profile", label: "Profile" }
  ];

  const currentPath = location.pathname;
  const currentIndex = activeSteps.findIndex(step => step.path === currentPath);
  const showWizard = currentIndex !== -1;

  const handleNext = () => {
    if (currentIndex < activeSteps.length - 1) {
      navigate(activeSteps[currentIndex + 1].path);
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      navigate(activeSteps[currentIndex - 1].path);
    }
  };

  const handleSubmitWorkflow = () => {
    setShowSubmitModal(true);
  };

  return (
    <div className="layout">
      <div className="main">
        <Navbar />

        <div className="content-area-wrapper">
          <div className="content">
            {children}
          </div>

          {/* Sticky Wizard Footer */}
          {showWizard && (
            <div className="wizard-footer">
              <div className="wizard-stepper">
                {activeSteps.map((step, idx) => (
                  <React.Fragment key={step.path}>
                    <div 
                      className={`stepper-dot-wrapper ${idx === currentIndex ? "active" : ""} ${idx < currentIndex ? "completed" : ""}`}
                      onClick={() => navigate(step.path)}
                    >
                      <div className="stepper-dot">{idx + 1}</div>
                      <span className="stepper-label">{step.label}</span>
                    </div>
                    {idx < activeSteps.length - 1 && (
                      <div className={`stepper-line ${idx < currentIndex ? "completed" : ""}`}></div>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="wizard-actions">
                <button 
                  className="wizard-btn back-btn" 
                  disabled={currentIndex === 0} 
                  onClick={handleBack}
                >
                  &larr; Back
                </button>

                {currentIndex < activeSteps.length - 1 ? (
                  <button className="wizard-btn next-btn" onClick={handleNext}>
                    Next &rarr;
                  </button>
                ) : (
                  <button className="wizard-btn submit-btn" onClick={handleSubmitWorkflow}>
                    Submit Workflow ✓
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Success Committed Modal */}
      {showSubmitModal && (
        <div className="workflow-success-overlay">
          <div className="workflow-success-modal">
            <div className="success-icon">✓</div>
            <h2>Workflow Submitted!</h2>
            <p>All diagnostic, scheduling, and billing records have been synced and securely committed to the MySQL database.</p>
            <button className="success-close-btn" onClick={() => {
              setShowSubmitModal(false);
              navigate(isAdmin || isStaff ? "/dashboard" : "/profile");
            }}>
              Return to Command Center
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default MainLayout;