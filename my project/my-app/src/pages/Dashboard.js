import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../services/dashboardService";
import { addPatient } from "../services/PatientService";
import "./Dashboard.css";

function Dashboard() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalRevenue: 0,
    totalMedicines: 0,
    totalReports: 0,
    totalStaff: 0,
    todayAppointments: 0
  });

  const [loading, setLoading] = useState(true);

  const [beds, setBeds] = useState(() => {
    const saved = localStorage.getItem("hims_mock_beds");
    if (saved) {
      return JSON.parse(saved);
    }
    const defaultBeds = [
      { id: "icu-1", room: "ICU-101", type: "ICU", status: "Occupied", patientName: "Robert Johnson", patientAge: 62, patientPhone: "+91 9876543222", disease: "Diabetes" },
      { id: "icu-2", room: "ICU-102", type: "ICU", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "icu-3", room: "ICU-103", type: "ICU", status: "Occupied", patientName: "Alice Smith", patientAge: 45, patientPhone: "+91 9876543233", disease: "Heart Failure" },
      { id: "icu-4", room: "ICU-104", type: "ICU", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "icu-5", room: "ICU-105", type: "ICU", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "gw-1", room: "GW-201", type: "General Ward", status: "Occupied", patientName: "John Doe", patientAge: 35, patientPhone: "+91 9876543220", disease: "Tibia Fracture" },
      { id: "gw-2", room: "GW-202", type: "General Ward", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "gw-3", room: "GW-203", type: "General Ward", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "gw-4", room: "GW-204", type: "General Ward", status: "Occupied", patientName: "Jane Miller", patientAge: 29, patientPhone: "+91 9876543221", disease: "Migraine" },
      { id: "gw-5", room: "GW-205", type: "General Ward", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "gw-6", room: "GW-206", type: "General Ward", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "gw-7", room: "GW-207", type: "General Ward", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" },
      { id: "gw-8", room: "GW-208", type: "General Ward", status: "Available", patientName: "", patientAge: "", patientPhone: "", disease: "" }
    ];
    localStorage.setItem("hims_mock_beds", JSON.stringify(defaultBeds));
    return defaultBeds;
  });

  const [smsNotification, setSmsNotification] = useState(null);

  const [isAdmitModalOpen, setIsAdmitModalOpen] = useState(false);
  const [selectedBedForAdmit, setSelectedBedForAdmit] = useState(null);
  const [admitForm, setAdmitForm] = useState({
    patientId: "",
    patientName: "",
    patientAge: "",
    patientPhone: "",
    disease: ""
  });
  const [registeredPatients, setRegisteredPatients] = useState([]);

  useEffect(() => {
    if (isAdmitModalOpen) {
      const patientsData = localStorage.getItem("hims_mock_patients");
      if (patientsData) {
        setRegisteredPatients(JSON.parse(patientsData));
      }
    }
  }, [isAdmitModalOpen]);

  const handleAdmitPatientSelect = (e) => {
    const val = e.target.value;
    if (val === "") {
      setAdmitForm({ patientId: "", patientName: "", patientAge: "", patientPhone: "", disease: "" });
    } else if (val === "custom") {
      setAdmitForm({ patientId: "custom", patientName: "", patientAge: "", patientPhone: "", disease: "" });
    } else {
      const selected = registeredPatients.find(p => p.id === val);
      if (selected) {
        setAdmitForm({
          patientId: val,
          patientName: selected.name,
          patientAge: selected.age,
          patientPhone: selected.phone,
          disease: selected.disease || ""
        });
      }
    }
  };

  const sendLiveSMS = async (number, message) => {
    try {
      const cleanNumber = number.replace(/[^+\d]/g, ""); // keep only digits and +
      const response = await fetch("https://textbelt.com/text", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          number: cleanNumber,
          message: message,
          key: "textbelt"
        })
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Failed to send live SMS:", error);
      return { success: false, error: "Network Error calling SMS gateway" };
    }
  };

  const handleAdmitSubmit = (e) => {
    e.preventDefault();
    if (!admitForm.patientName || !admitForm.patientAge || !admitForm.patientPhone || !admitForm.disease) {
      alert("Please fill all required fields.");
      return;
    }

    const updatedBeds = beds.map(b => {
      if (b.id === selectedBedForAdmit.id) {
        return {
          ...b,
          status: "Occupied",
          patientName: admitForm.patientName,
          patientAge: parseInt(admitForm.patientAge),
          patientPhone: admitForm.patientPhone,
          disease: admitForm.disease
        };
      }
      return b;
    });

    setBeds(updatedBeds);
    localStorage.setItem("hims_mock_beds", JSON.stringify(updatedBeds));
    setIsAdmitModalOpen(false);

    // Save patient to backend if it's a newly typed patient
    if (admitForm.patientId === "custom" || !admitForm.patientId) {
      addPatient({
        name: admitForm.patientName,
        age: parseInt(admitForm.patientAge),
        gender: "Male",
        phone: admitForm.patientPhone,
        address: "Admitted from Dashboard",
        disease: admitForm.disease
      })
      .then(res => {
        console.log("Admitted patient successfully added to database:", res.data);
      })
      .catch(err => {
        console.error("Failed to add admitted patient to backend:", err);
      });
    }

    // Trigger SMS sending
    const smsMessage = `Dear ${admitForm.patientName}, you have been admitted to HIMS in bed ${selectedBedForAdmit.room}. Diagnosis: ${admitForm.disease}. Get well soon!`;
    setSmsNotification({
      patientName: admitForm.patientName,
      phone: admitForm.patientPhone,
      message: smsMessage,
      status: "sending"
    });

    sendLiveSMS(admitForm.patientPhone, smsMessage).then(res => {
      setSmsNotification(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: res.success ? "delivered" : "failed",
          errorMsg: res.success ? "" : (res.error || "Free quota limit reached (1/day)")
        };
      });
    });
  };

  const userString = localStorage.getItem("user");
  let userRole = "";
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userRole = user && user.role ? user.role.toLowerCase() : "";
    } catch (e) {
      console.error("Error parsing user role for dashboard:", e);
    }
  }
  const isAuthorizedToDischarge = userRole === "admin" || userRole === "staff";

  const handleDischarge = (bedId) => {
    const bed = beds.find(b => b.id === bedId);
    if (!bed) return;

    const confirmDischarge = window.confirm(`Discharge patient "${bed.patientName}" from bed ${bed.room}?`);
    if (!confirmDischarge) return;

    const smsMessage = `Dear ${bed.patientName}, your treatment is complete. You have been successfully discharged from HIMS. Thank you!`;
    setSmsNotification({
      patientName: bed.patientName,
      phone: bed.patientPhone,
      message: smsMessage,
      status: "sending"
    });

    sendLiveSMS(bed.patientPhone, smsMessage).then(res => {
      setSmsNotification(prev => {
        if (!prev) return null;
        return {
          ...prev,
          status: res.success ? "delivered" : "failed",
          errorMsg: res.success ? "" : (res.error || "Free quota limit reached (1/day)")
        };
      });
    });

    const updatedBeds = beds.map(b => {
      if (b.id === bedId) {
        return {
          ...b,
          status: "Available",
          patientName: "",
          patientAge: "",
          patientPhone: "",
          disease: ""
        };
      }
      return b;
    });

    setBeds(updatedBeds);
    localStorage.setItem("hims_mock_beds", JSON.stringify(updatedBeds));
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await getDashboardStats();
      if (response.data) {
        setStats(response.data);
      }
    } catch (error) {
      console.error("Failed to load dashboard metrics", error);
    } finally {
      setLoading(false);
    }
  };

  // Reusable SVG Circular Progress ring helper
  const CircularProgress = ({ percent, color, label }) => {
    const radius = 30;
    const strokeWidth = 6;
    const circumference = 2 * Math.PI * radius;
    const strokeDashoffset = circumference - (percent / 100) * circumference;

    return (
      <div className="progress-ring-card">
        <div className="svg-wrapper">
          <svg width="80" height="80">
            <circle cx="40" cy="40" r={radius} fill="transparent" stroke="rgba(255,255,255,0.04)" strokeWidth={strokeWidth} />
            <circle 
              cx="40" 
              cy="40" 
              r={radius} 
              fill="transparent" 
              stroke={color} 
              strokeWidth={strokeWidth} 
              strokeDasharray={circumference} 
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              style={{ transition: "stroke-dashoffset 0.8s ease-in-out" }}
            />
            <text x="40" y="45" fill="#f8fafc" fontSize="12" fontWeight="800" textAnchor="middle">{percent}%</text>
          </svg>
        </div>
        <span className="progress-label">{label}</span>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="clinical-spinner"></div>
        <p>Syncing database metrics...</p>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-hero">
        <div className="hero-text">
          <h1>HIMS Command Center</h1>
          <p>Real-time clinical metrics, facility analytics, and staff workload overview.</p>
        </div>
        <div className="live-badge-wrapper">
          <span className="live-dot"></span>
          <span className="live-text">Live Sync</span>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Core Stats */}
        <div className="stat-card patients">
          <div className="card-accent"></div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="card-info">
            <h3>Total Patients</h3>
            <p className="card-value">{stats.totalPatients}</p>
            <span className="card-trend positive">Registered in HIMS</span>
          </div>
        </div>

        <div className="stat-card doctors">
          <div className="card-accent"></div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
          </div>
          <div className="card-info">
            <h3>Active Specialists</h3>
            <p className="card-value">{stats.totalDoctors}</p>
            <span className="card-trend neutral">On Call</span>
          </div>
        </div>

        <div className="stat-card appointments">
          <div className="card-accent"></div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="card-info">
            <h3>Appointments</h3>
            <p className="card-value">{stats.totalAppointments}</p>
            <span className="card-trend urgent">{stats.todayAppointments} Scheduled Today</span>
          </div>
        </div>

        <div className="stat-card revenue">
          <div className="card-accent"></div>
          <div className="card-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="card-info">
            <h3>Revenue Logged</h3>
            <p className="card-value">₹{(stats.totalRevenue || 0).toLocaleString("en-IN")}</p>
            <span className="card-trend positive">Commited Billings</span>
          </div>
        </div>
      </div>

      {/* Advanced Visual Analytics Center */}
      <div className="analytics-section-wrapper">
        <div className="chart-container-card">
          <div className="chart-header">
            <h4>📈 Weekly Admissions & Revenue Trend</h4>
            <span className="chart-sub">Real-time facility load indicators</span>
          </div>
          <div className="chart-body">
            <svg viewBox="0 0 500 160" className="analytics-svg">
              <defs>
                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="40" y1="20" x2="480" y2="20" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="60" x2="480" y2="60" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="100" x2="480" y2="100" stroke="rgba(255,255,255,0.03)" />
              <line x1="40" y1="140" x2="480" y2="140" stroke="rgba(255,255,255,0.08)" strokeWidth="1.5" />
              
              <text x="12" y="24" fill="#64748b" fontSize="8">100k</text>
              <text x="12" y="64" fill="#64748b" fontSize="8">50k</text>
              <text x="12" y="104" fill="#64748b" fontSize="8">10k</text>
              <text x="12" y="144" fill="#64748b" fontSize="8">0</text>
              
              <path d="M40,140 L40,120 L110,95 L180,110 L250,70 L320,55 L390,45 L480,25 L480,140 Z" fill="url(#chartGradient)" />
              <path d="M40,120 L110,95 L180,110 L250,70 L320,55 L390,45 L480,25" fill="none" stroke="#6366f1" strokeWidth="2.5" />
              
              <circle cx="40" cy="120" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="110" cy="95" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="180" cy="110" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="250" cy="70" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="320" cy="55" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="390" cy="45" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              <circle cx="480" cy="25" r="4" fill="#6366f1" stroke="#1e293b" strokeWidth="1.5" />
              
              <text x="35" y="154" fill="#64748b" fontSize="8">Mon</text>
              <text x="105" y="154" fill="#64748b" fontSize="8">Tue</text>
              <text x="175" y="154" fill="#64748b" fontSize="8">Wed</text>
              <text x="245" y="154" fill="#64748b" fontSize="8">Thu</text>
              <text x="315" y="154" fill="#64748b" fontSize="8">Fri</text>
              <text x="385" y="154" fill="#64748b" fontSize="8">Sat</text>
              <text x="470" y="154" fill="#64748b" fontSize="8">Sun</text>
            </svg>
          </div>
        </div>

        <div className="gauges-container-card">
          <div className="gauges-header">
            <h4>📋 Operational Health Index</h4>
            <span className="gauges-sub">Live facility resource capacity utilization</span>
          </div>
          <div className="gauges-body">
            <CircularProgress 
              percent={beds.length > 0 ? Math.round((beds.filter(b => b.status === "Occupied").length / beds.length) * 100) : 0} 
              color="#3b82f6" 
              label="Bed Occupancy" 
            />
            <CircularProgress percent={42} color="#f59e0b" label="Lab Queue Load" />
            <CircularProgress percent={85} color="#10b981" label="Pharmacy Stocks" />
          </div>
        </div>
      </div>

      <div className="dashboard-secondary-grid">
        {/* Support Stats */}
        <div className="secondary-card">
          <div className="secondary-header">
            <span className="sec-icon">💊</span>
            <h4>Pharmacy Inventory</h4>
          </div>
          <div className="secondary-body">
            <h2>{(stats.totalMedicines || 0).toLocaleString("en-IN")} Units</h2>
            <p>Pharmaceutical products and medicines registered in the local inventory.</p>
          </div>
        </div>

        <div className="secondary-card">
          <div className="secondary-header">
            <span className="sec-icon">🧪</span>
            <h4>Laboratory Reports</h4>
          </div>
          <div className="secondary-body">
            <h2>{stats.totalReports} Logged</h2>
            <p>Completed lab diagnostics and ongoing clinical evaluations.</p>
          </div>
        </div>

        <div className="secondary-card">
          <div className="secondary-header">
            <span className="sec-icon">👥</span>
            <h4>Active Care Providers</h4>
          </div>
          <div className="secondary-body">
            <h2>{stats.totalStaff} Staff</h2>
            <p>Nurses, pharmacists, administrators, and technicians currently assigned.</p>
          </div>
        </div>
      </div>

      {/* Beds and ICU Occupancy Coordinator Section */}
      <div className="beds-manager-section">
        <div className="beds-section-header">
          <h2>🏥 Live Beds & ICU Occupancy Coordinator</h2>
          <p>Real-time beds status tracking, patient placement profiles, and discharge notification dispatcher.</p>
        </div>

        <div className="beds-summary-cards">
          <div className="beds-summary-card icu">
            <span className="summary-icon">🚨</span>
            <div className="summary-info">
              <h4>ICU Beds (Intensive Care Unit)</h4>
              <p>{beds.filter(b => b.type === "ICU" && b.status === "Available").length} / {beds.filter(b => b.type === "ICU").length} Beds Available</p>
            </div>
          </div>
          <div className="beds-summary-card general">
            <span className="summary-icon">🛌</span>
            <div className="summary-info">
              <h4>General Ward Beds</h4>
              <p>{beds.filter(b => b.type === "General Ward" && b.status === "Available").length} / {beds.filter(b => b.type === "General Ward").length} Beds Available</p>
            </div>
          </div>
        </div>

        <div className="beds-lists-grid">
          {/* ICU Wards list */}
          <div className="beds-list-column">
            <h3>ICU Beds</h3>
            <div className="beds-column-grid">
              {beds.filter(b => b.type === "ICU").map(bed => (
                <div key={bed.id} className={`dashboard-bed-card ${bed.status.toLowerCase()}`}>
                  <div className="bed-card-header">
                    <span className="bed-room-no">{bed.room}</span>
                    <span className={`bed-status-pill ${bed.status.toLowerCase()}`}>{bed.status}</span>
                  </div>
                  {bed.status === "Occupied" ? (
                    <div className="bed-card-body">
                      <p><strong>Patient:</strong> {bed.patientName} ({bed.patientAge} yrs)</p>
                      <p><strong>Diagnosis:</strong> {bed.disease}</p>
                      <p><strong>Phone:</strong> {bed.patientPhone}</p>
                      {isAuthorizedToDischarge && (
                        <button className="bed-action-discharge-btn" onClick={() => handleDischarge(bed.id)}>
                          Discharge Patient
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bed-card-body empty">
                      <p>Ready for intake</p>
                      {isAuthorizedToDischarge && (
                        <button 
                          className="bed-action-admit-btn" 
                          onClick={() => {
                            setSelectedBedForAdmit(bed);
                            setAdmitForm({ patientId: "", patientName: "", patientAge: "", patientPhone: "", disease: "" });
                            setIsAdmitModalOpen(true);
                          }}
                        >
                          Admit Patient
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* General Wards list */}
          <div className="beds-list-column">
            <h3>General Ward Beds</h3>
            <div className="beds-column-grid">
              {beds.filter(b => b.type === "General Ward").map(bed => (
                <div key={bed.id} className={`dashboard-bed-card ${bed.status.toLowerCase()}`}>
                  <div className="bed-card-header">
                    <span className="bed-room-no">{bed.room}</span>
                    <span className={`bed-status-pill ${bed.status.toLowerCase()}`}>{bed.status}</span>
                  </div>
                  {bed.status === "Occupied" ? (
                    <div className="bed-card-body">
                      <p><strong>Patient:</strong> {bed.patientName} ({bed.patientAge} yrs)</p>
                      <p><strong>Diagnosis:</strong> {bed.disease}</p>
                      <p><strong>Phone:</strong> {bed.patientPhone}</p>
                      {isAuthorizedToDischarge && (
                        <button className="bed-action-discharge-btn" onClick={() => handleDischarge(bed.id)}>
                          Discharge Patient
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="bed-card-body empty">
                      <p>Ready for intake</p>
                      {isAuthorizedToDischarge && (
                        <button 
                          className="bed-action-admit-btn" 
                          onClick={() => {
                            setSelectedBedForAdmit(bed);
                            setAdmitForm({ patientId: "", patientName: "", patientAge: "", patientPhone: "", disease: "" });
                            setIsAdmitModalOpen(true);
                          }}
                        >
                          Admit Patient
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Admission Form Modal */}
      {isAdmitModalOpen && selectedBedForAdmit && (
        <div className="admit-modal-overlay">
          <div className="admit-modal-content">
            <div className="admit-modal-header">
              <h3>🛌 Admit Patient to Bed {selectedBedForAdmit.room}</h3>
              <p>Allocate a bed and notify the patient via automated SMS simulation.</p>
            </div>
            
            <form onSubmit={handleAdmitSubmit} className="admit-modal-form">
              <div className="admit-form-group">
                <label>Select Registered Patient</label>
                <select 
                  value={admitForm.patientId} 
                  onChange={handleAdmitPatientSelect}
                  className="admit-select"
                >
                  <option value="">-- Select Registered Patient --</option>
                  {registeredPatients.map(p => (
                    <option key={p.id} value={p.id}>{p.name} (ID: {p.id})</option>
                  ))}
                  <option value="custom">+ Register / Admit Custom Patient</option>
                </select>
              </div>

              <div className="admit-form-group">
                <label>Patient Full Name *</label>
                <input 
                  type="text" 
                  required 
                  value={admitForm.patientName} 
                  onChange={(e) => setAdmitForm({ ...admitForm, patientName: e.target.value })}
                  disabled={admitForm.patientId !== "" && admitForm.patientId !== "custom"}
                  placeholder="Enter patient full name"
                />
              </div>

              <div className="admit-form-row">
                <div className="admit-form-group">
                  <label>Age *</label>
                  <input 
                    type="number" 
                    required 
                    value={admitForm.patientAge} 
                    onChange={(e) => setAdmitForm({ ...admitForm, patientAge: e.target.value })}
                    disabled={admitForm.patientId !== "" && admitForm.patientId !== "custom"}
                    placeholder="Age"
                  />
                </div>
                <div className="admit-form-group">
                  <label>Phone Number *</label>
                  <input 
                    type="text" 
                    required 
                    value={admitForm.patientPhone} 
                    onChange={(e) => setAdmitForm({ ...admitForm, patientPhone: e.target.value })}
                    disabled={admitForm.patientId !== "" && admitForm.patientId !== "custom"}
                    placeholder="Phone Number"
                  />
                </div>
              </div>

              <div className="admit-form-group">
                <label>Primary Diagnosis / Disease *</label>
                <input 
                  type="text" 
                  required 
                  value={admitForm.disease} 
                  onChange={(e) => setAdmitForm({ ...admitForm, disease: e.target.value })}
                  placeholder="E.g. Fever, Fracture, Post-op"
                />
              </div>

              <div className="admit-modal-actions">
                <button type="button" className="admit-cancel-btn" onClick={() => setIsAdmitModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="admit-confirm-btn">
                  Admit Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMS Simulation Dialog Modal */}
      {smsNotification && (
        <div className="sms-toast-overlay">
          <div className="sms-toast-content">
            <div className="sms-icon-wrapper">📱</div>
            <div className="sms-details">
              <h4>SMS Notification Dispatcher</h4>
              <p className="sms-meta">To: <strong>{smsNotification.phone}</strong> ({smsNotification.patientName})</p>
              
              <div className="sms-status-container">
                {smsNotification.status === "sending" && (
                  <span className="sms-status-badge sending">⏳ Contacting gateway...</span>
                )}
                {smsNotification.status === "delivered" && (
                  <span className="sms-status-badge delivered">✅ Live SMS Sent!</span>
                )}
                {smsNotification.status === "failed" && (
                  <span className="sms-status-badge failed" title={smsNotification.errorMsg}>
                    ⚠️ Gateway Limit Reached (Using Simulation)
                  </span>
                )}
              </div>

              <div className="sms-message-bubble">
                <p>"{smsNotification.message}"</p>
              </div>

              <div className="sms-action-buttons">
                <a 
                  href={`https://api.whatsapp.com/send?phone=${smsNotification.phone.replace(/\D/g, "")}&text=${encodeURIComponent(smsNotification.message)}`}
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="sms-dispatch-btn whatsapp"
                >
                  🟢 Send via WhatsApp
                </a>
                <a 
                  href={`sms:${smsNotification.phone.replace(/\s/g, "")}?body=${encodeURIComponent(smsNotification.message)}`}
                  className="sms-dispatch-btn direct-sms"
                >
                  💬 Send via Native SMS
                </a>
              </div>

              <p className="sms-note">
                Note: Free live gateway limits apply (1 text/day). Use WhatsApp or Native SMS buttons above to send messages directly from your device!
              </p>
            </div>
            <button className="sms-close-btn" onClick={() => setSmsNotification(null)}>
              Dismiss Panel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;