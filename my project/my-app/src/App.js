import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Patients from "./pages/Patients";
import Doctors from "./pages/Doctors";
import Appointments from "./pages/Appointments";
import Billing from "./pages/Billing";
import Pharmacy from "./pages/Pharmacy";
import Laboratory from "./pages/Laboratory";
import MedicalRecords from "./pages/MedicalRecords";
import Reports from "./pages/Reports";
import Staff from "./pages/Staff";
import Profile from "./pages/Profile";
import SystemSettings from "./pages/SystemSettings";
import Login from "./pages/Login";
import Register from "./pages/Register";
import NotFound from "./pages/NotFound";
import ProtectedRoute from "./components/ProtectedRoute";
import MainLayout from "./layouts/MainLayout";
import Unauthorized from "./pages/Unauthorized";
import Treatments from "./pages/Treatments";
import ResourcesDashboard from "./pages/ResourcesDashboard";

import "./App.css";
import { LanguageProvider } from "./context/LanguageContext";

function App() {
  const allRoles = ["Admin", "Staff", "User"];
  const adminAndStaff = ["Admin", "Staff"];

  return (
    <LanguageProvider>
      <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Login />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin-login" element={<Login />} />
        <Route path="/staff-login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route path="/home" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><Home /></MainLayout></ProtectedRoute>} />
        <Route path="/dashboard" element={<ProtectedRoute allowedRoles={adminAndStaff}><MainLayout><Dashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/patients" element={<ProtectedRoute allowedRoles={adminAndStaff}><MainLayout><Patients /></MainLayout></ProtectedRoute>} />
        <Route path="/doctors" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><Doctors /></MainLayout></ProtectedRoute>} />
        <Route path="/appointments" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><Appointments /></MainLayout></ProtectedRoute>} />
        <Route path="/treatments" element={<ProtectedRoute allowedRoles={adminAndStaff}><MainLayout><Treatments /></MainLayout></ProtectedRoute>} />
        <Route path="/resources" element={<ProtectedRoute allowedRoles={adminAndStaff}><MainLayout><ResourcesDashboard /></MainLayout></ProtectedRoute>} />
        <Route path="/billing" element={<ProtectedRoute allowedRoles={["Admin"]}><MainLayout><Billing /></MainLayout></ProtectedRoute>} />
        <Route path="/pharmacy" element={<ProtectedRoute allowedRoles={adminAndStaff}><MainLayout><Pharmacy /></MainLayout></ProtectedRoute>} />
        <Route path="/laboratory" element={<ProtectedRoute allowedRoles={adminAndStaff}><MainLayout><Laboratory /></MainLayout></ProtectedRoute>} />
        <Route path="/medical-records" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><MedicalRecords /></MainLayout></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute allowedRoles={["Admin"]}><MainLayout><Reports /></MainLayout></ProtectedRoute>} />
        <Route path="/staff" element={<ProtectedRoute allowedRoles={["Admin"]}><MainLayout><Staff /></MainLayout></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute allowedRoles={allRoles}><MainLayout><Profile /></MainLayout></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute allowedRoles={["Admin"]}><MainLayout><SystemSettings /></MainLayout></ProtectedRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
    </LanguageProvider>
  );
}

export default App;