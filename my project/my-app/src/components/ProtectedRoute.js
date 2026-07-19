import React from "react";
import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children, allowedRoles }) => {
  // Check if user session exists in localStorage
  const userString = localStorage.getItem('user');

  if (!userString) {
    const isAdminOnly = allowedRoles && 
      allowedRoles.map(r => r.toLowerCase()).includes('admin') && 
      !allowedRoles.map(r => r.toLowerCase()).includes('staff') && 
      !allowedRoles.map(r => r.toLowerCase()).includes('user');
    
    return <Navigate to={isAdminOnly ? "/admin-login" : "/login"} replace />;
  }

  try {
    const userObj = JSON.parse(userString);
    if (!userObj || !userObj.username) {
      return <Navigate to="/login" replace />;
    }

    if (allowedRoles && allowedRoles.length > 0) {
      const userRole = (userObj.role || "").toLowerCase();
      const isAuthorized = allowedRoles.map(r => r.toLowerCase()).includes(userRole);
      
      if (!isAuthorized) {
        return <Navigate to="/unauthorized" replace />;
      }
    }
  } catch (e) {
    console.error("Error parsing user auth status:", e);
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
