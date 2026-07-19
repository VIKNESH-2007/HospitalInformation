import React, { useState, useEffect } from "react";
import "./Patients.css";
import Button from "../components/Button";
import SearchBar from "../components/SearchBar";
import Modal from "../components/Modal";
import { 
  getPatients, 
  addPatient, 
  updatePatient, 
  deletePatient,
  searchPatients,
  verifyIdentity,
  getDuplicates,
  mergePatients,
  getPatientDocuments,
  uploadPatientDocument,
  verifyPatientDocument
} from "../services/PatientService";

const mapPatientObj = (patient) => {
  if (!patient) return patient;
  let hId = patient.hospitalId;
  if (!hId) {
    hId = `HOSP-${String(patient.id).padStart(4, "0")}`;
  }
  let fName = patient.firstName;
  let lName = patient.lastName;
  if (!fName && patient.name) {
    const parts = patient.name.split(" ");
    fName = parts[0] || "";
    lName = parts.slice(1).join(" ") || "";
  }
  return {
    ...patient,
    hospitalId: hId,
    firstName: fName,
    lastName: lName
  };
};

function Patients() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("view"); // 'view' | 'add' | 'edit'
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [duplicateAlert, setDuplicateAlert] = useState(null);

  // Tab View Management
  const [activeTab, setActiveTab] = useState("list"); // 'list' | 'search' | 'duplicates'

  // Advanced AI Search Filters State
  const [advancedFilters, setAdvancedFilters] = useState({
    name: "",
    dob: "",
    phone: "",
    gender: "",
    fatherName: "",
    aadhar: "",
    city: "",
    idType: "Aadhar",
    activeOnly: true,
    showDuplicates: false
  });
  const [searchResults, setSearchResults] = useState([]);
  const [searchLoading, setSearchLoading] = useState(false);

  // Duplicate Resolution States
  const [duplicatesList, setDuplicatesList] = useState([]);
  const [selectedMergePair, setSelectedMergePair] = useState(null);
  const [mergeNotes, setMergeNotes] = useState("");
  const [mergeAuditLogs, setMergeAuditLogs] = useState([]);

  // Multi-step Identity Verification Stepper States
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [verifyPatient, setVerifyPatient] = useState(null);
  const [verificationStep, setVerificationStep] = useState(1); // 1: Photo Match, 2: OTP SMS, 3: Demographics, 4: Biometric scan, 5: Liveness task
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [enteredOtp, setEnteredOtp] = useState("");
  const [otpVerified, setOtpVerified] = useState(false);
  const [demographicsConfirmed, setDemographicsConfirmed] = useState({
    phone: false,
    dob: false,
    city: false,
    aadharLast4: false
  });
  
  // Biometrics & Liveness Spoof States
  const [scannedFingerprint, setScannedFingerprint] = useState(null);
  const [selfieCaptured, setSelfieCaptured] = useState(null);
  const [scanningBiometric, setScanningBiometric] = useState(false);
  const [livenessConfirmed, setLivenessConfirmed] = useState(false);
  const [livenessTask, setLivenessTask] = useState("Blink twice"); // Spoof checks
  const [livenessStepDone, setLivenessStepDone] = useState(false);
  const [verificationOutcome, setVerificationOutcome] = useState(null);

  // Form Fields State for registration/editing
  const [formData, setFormData] = useState({
    firstName: "",
    middleName: "",
    lastName: "",
    nameAlias: "",
    age: "",
    gender: "Male",
    phone: "",
    phoneSecondary: "",
    email: "",
    emailSecondary: "",
    dob: "",
    bloodGroup: "O+",
    fatherName: "",
    motherName: "",
    spouseName: "",
    idProof: "",
    aadharNumber: "",
    panCard: "",
    voterId: "",
    drivingLicense: "",
    address: "",
    permanentAddress: "",
    city: "",
    state: "",
    pinCode: "",
    disease: "",
    patientPhoto: "",
    occupation: "",
    employerName: ""
  });

  // User details and authorization role configuration
  const userString = localStorage.getItem("user");
  let userRole = "";
  let isAdmin = false;
  let isStaff = false;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      userRole = (user && user.role) ? user.role.toLowerCase() : "";
      isAdmin = userRole === "admin";
      isStaff = userRole === "staff";
    } catch (e) {
      console.error("Error parsing user role for Patients:", e);
    }
  }

  useEffect(() => {
    loadPatients();
    loadDuplicates();
  }, []);

  const loadPatients = async () => {
    try {
      setLoading(true);
      const response = await getPatients();
      if (response.data) {
        setPatients(response.data.map(mapPatientObj));
      }
    } catch (error) {
      console.error("Failed to load patients list", error);
    } finally {
      setLoading(false);
    }
  };

  const loadDuplicates = async () => {
    try {
      const response = await getDuplicates();
      if (response.data) {
        const mapped = response.data.map(pair => ({
          ...pair,
          patientA: mapPatientObj(pair.patientA),
          patientB: mapPatientObj(pair.patientB)
        }));
        setDuplicatesList(mapped);
      }
    } catch (error) {
      console.error("Failed to load duplicates list", error);
    }
  };

  const handleOpenAddModal = () => {
    setModalMode("add");
    setFormData({
      firstName: "",
      middleName: "",
      lastName: "",
      nameAlias: "",
      age: "",
      gender: "Male",
      phone: "",
      phoneSecondary: "",
      email: "",
      emailSecondary: "",
      dob: "",
      bloodGroup: "O+",
      fatherName: "",
      motherName: "",
      spouseName: "",
      idProof: "Aadhar",
      aadharNumber: "",
      panCard: "",
      voterId: "",
      drivingLicense: "",
      address: "",
      permanentAddress: "",
      city: "",
      state: "",
      pinCode: "",
      disease: "",
      patientPhoto: "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=200&h=200&fit=crop", // placeholder portrait
      occupation: "",
      employerName: ""
    });
    setDuplicateAlert(null);
    setShowModal(true);
  };

  const handleOpenViewModal = (patient) => {
    setModalMode("view");
    setSelectedPatient(patient);
    setDuplicateAlert(null);
    loadPatientDocuments(patient.id);
    setShowModal(true);
  };

  const handleOpenEditModal = (patient) => {
    setModalMode("edit");
    setSelectedPatient(patient);
    setFormData({
      firstName: patient.firstName || "",
      middleName: patient.middleName || "",
      lastName: patient.lastName || "",
      nameAlias: patient.nameAlias || "",
      age: patient.age,
      gender: patient.gender,
      phone: patient.phone,
      phoneSecondary: patient.phoneSecondary || "",
      email: patient.email || "",
      emailSecondary: patient.emailSecondary || "",
      dob: patient.dob ? patient.dob.split("T")[0] : "",
      bloodGroup: patient.bloodGroup || "O+",
      fatherName: patient.fatherName || "",
      motherName: patient.motherName || "",
      spouseName: patient.spouseName || "",
      idProof: patient.idProof || "Aadhar",
      aadharNumber: patient.aadharNumber || "",
      panCard: patient.panCard || "",
      voterId: patient.voterId || "",
      drivingLicense: patient.drivingLicense || "",
      address: patient.address || "",
      permanentAddress: patient.permanentAddress || "",
      city: patient.city || "",
      state: patient.state || "",
      pinCode: patient.pinCode || "",
      disease: patient.disease || "",
      patientPhoto: patient.patientPhoto || "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=200&h=200&fit=crop",
      occupation: patient.occupation || "",
      employerName: patient.employerName || ""
    });
    setDuplicateAlert(null);
    setShowModal(true);
  };

  // Scanned Document Manager states & handlers
  const [patientDocs, setPatientDocs] = useState([]);
  const [newDocData, setNewDocData] = useState({
    documentType: "Aadhar",
    documentNumber: "",
    fileName: ""
  });
  const [docVerifyForm, setDocVerifyForm] = useState(null); // holds docId being verified
  const [verifyEmpId, setVerifyEmpId] = useState("");
  const [verifyPassword, setVerifyPassword] = useState("");

  const loadPatientDocuments = async (patientId) => {
    try {
      const res = await getPatientDocuments(patientId);
      if (res.data) setPatientDocs(res.data);
    } catch (e) {
      console.error("Failed to load documents list:", e);
    }
  };

  const handleUploadDoc = async (e) => {
    e.preventDefault();
    if (!newDocData.documentNumber) {
      alert("Please enter the document ID card number.");
      return;
    }
    try {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      await uploadPatientDocument(selectedPatient.id, {
        documentType: newDocData.documentType,
        documentNumber: newDocData.documentNumber,
        fileName: `${newDocData.documentType}_scan.jpg`,
        fileContent: "mock_base64_id_card_scan",
        uploadedBy: user.username || "Staff"
      });
      alert("✓ Scanned identity document uploaded successfully.");
      setNewDocData({ documentType: "Aadhar", documentNumber: "", fileName: "" });
      loadPatientDocuments(selectedPatient.id);
    } catch (err) {
      console.error(err);
      alert("Upload failed.");
    }
  };

  const handleVerifyDoc = async (docId, status) => {
    if (!verifyEmpId || !verifyPassword) {
      alert("Please enter your clinical Employee ID and verification password.");
      return;
    }
    try {
      await verifyPatientDocument(docId, {
        employeeId: verifyEmpId,
        password: verifyPassword,
        verificationStatus: status,
        notes: `Reviewed file scan under HIPAA regulations. Scanned content matches biographical inputs.`
      });
      alert(`✓ Scanned document has been set to ${status}.`);
      setDocVerifyForm(null);
      setVerifyEmpId("");
      setVerifyPassword("");
      loadPatientDocuments(selectedPatient.id);
    } catch (err) {
      console.error(err);
      alert("Identity verification failed. Please verify signing credentials.");
    }
  };

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSavePatient = async (e) => {
    e.preventDefault();
    if (
      !formData.firstName ||
      !formData.lastName ||
      !formData.age ||
      !formData.phone ||
      !formData.email ||
      !formData.dob ||
      !formData.fatherName ||
      !formData.disease
    ) {
      alert("Please fill all required fields marked with *");
      return;
    }

    try {
      const payload = {
        ...formData,
        name: `${formData.firstName} ${formData.lastName}`.trim(),
        age: parseInt(formData.age),
        dob: new Date(formData.dob).toISOString(),
        createdDate: new Date().toISOString(),
        lastModified: new Date().toISOString()
      };

      if (modalMode === "add") {
        const response = await addPatient(payload);
        alert("Patient registered successfully with Hospital ID: " + response.data.hospitalId);
      } else if (modalMode === "edit") {
        await updatePatient(selectedPatient.id, {
          ...selectedPatient,
          ...payload
        });
        alert("Patient updated successfully!");
      }
      setShowModal(false);
      loadPatients();
      loadDuplicates();
    } catch (error) {
      console.error("Failed to save patient", error);
      if (error.response && error.response.status === 409) {
        setDuplicateAlert(error.response.data);
      } else {
        alert("Error saving patient information.");
      }
    }
  };

  const handleDeletePatient = async (id, name) => {
    const confirmDelete = window.confirm(`Are you sure you want to delete patient "${name}"?`);
    if (confirmDelete) {
      try {
        await deletePatient(id);
        alert("Patient deleted successfully!");
        loadPatients();
        loadDuplicates();
      } catch (error) {
        console.error("Failed to delete patient", error);
        alert("Error deleting patient.");
      }
    }
  };

  // Advanced AI Search matching trigger
  const handleAdvancedSearch = async (e) => {
    if (e) e.preventDefault();
    setSearchLoading(true);
    try {
      const response = await searchPatients(advancedFilters);
      if (response.data) {
        setSearchResults(response.data.map(item => ({
          ...item,
          patient: mapPatientObj(item.patient)
        })));
      }
    } catch (error) {
      console.error("Advanced search failed:", error);
      alert("Search failed. Ensure backend API is active.");
    } finally {
      setSearchLoading(false);
    }
  };

  // Barcode / QR Card Scanner mock integration
  const handleBarcodeScanSim = () => {
    alert("🔍 Barcode Scan detected! Loading client card credentials...");
    setAdvancedFilters({
      name: "John Doe",
      dob: "1981-05-15",
      phone: "+9843546493",
      gender: "Male",
      fatherName: "George Doe",
      aadhar: "9012",
      city: "New York",
      idType: "Aadhar",
      activeOnly: true,
      showDuplicates: false
    });
    // Trigger search immediately with scanner inputs
    setTimeout(() => {
      searchPatients({
        name: "John Doe",
        dob: "1981-05-15",
        phone: "+9843546493",
        gender: "Male",
        fatherName: "George Doe",
        aadhar: "9012",
        city: "New York"
      }).then(res => {
        setSearchResults(res.data.map(item => ({
          ...item,
          patient: mapPatientObj(item.patient)
        })));
      });
    }, 100);
  };

  // Verification Checklist modal opener
  const startVerificationCheck = (patient) => {
    setVerifyPatient(patient);
    setVerificationStep(1);
    setOtpSent(false);
    setOtpVerified(false);
    setDemographicsConfirmed({
      phone: false,
      dob: false,
      city: false,
      aadharLast4: false
    });
    setScannedFingerprint(null);
    setSelfieCaptured(null);
    setLivenessConfirmed(false);
    setLivenessStepDone(false);
    setVerificationOutcome(null);
    setShowVerificationModal(true);
  };

  // Verification Step 2: Send OTP
  const sendMockOtp = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setOtpCode(code);
    setOtpSent(true);
    alert(`💬 [SMS Server Simulator] OTP Code sent to ${verifyPatient.phone}: ${code}`);
  };

  const confirmMockOtp = () => {
    if (enteredOtp === otpCode) {
      setOtpVerified(true);
      alert("✓ OTP SMS Authenticated successfully.");
      setVerificationStep(3);
    } else {
      alert("❌ Invalid OTP. Try again.");
    }
  };

  // Verification Step 4: Biometric Scan simulation
  const simulateFingerprintCapture = async () => {
    setScanningBiometric(true);
    setTimeout(async () => {
      setScanningBiometric(false);
      // Mock biometric template from WebAuthn device
      const mockTemplate = "fingerprint_john_doe_hash";
      setScannedFingerprint(mockTemplate);

      try {
        const response = await verifyIdentity({
          patientId: verifyPatient.id,
          biometricType: "fingerprint",
          biometricData: mockTemplate,
          livenessConfirmed: true
        });

        if (response.data.match) {
          alert(`✓ WebAuthn: Fingerprint matched stored template. Confidence: ${response.data.confidence}%`);
          setVerificationStep(5);
        } else {
          alert("❌ Biometric match failed!");
        }
      } catch (e) {
        console.error(e);
        alert("Fingerprint verification request failed.");
      }
    }, 1200);
  };

  // Verification Step 4b: Face matching fallback liveness
  const simulateFaceMatchingCapture = async () => {
    setScanningBiometric(true);
    setTimeout(async () => {
      setScanningBiometric(false);
      const mockSelfie = "mock_face_john_doe_base64"; // matching string
      setSelfieCaptured(mockSelfie);

      try {
        const response = await verifyIdentity({
          patientId: verifyPatient.id,
          biometricType: "face",
          biometricData: mockSelfie,
          livenessConfirmed: true
        });

        if (response.data.match) {
          alert(`✓ AI Face Match: Selfie matched stored photo ID. Confidence: ${response.data.confidence}%`);
          setVerificationStep(5);
        } else {
          alert("❌ Facial structures mismatch!");
        }
      } catch (e) {
        console.error(e);
        alert("Face matching fallback failed.");
      }
    }, 1200);
  };

  // Verification Step 5: Liveness Spoof Challenge completion
  const handleLivenessChallenge = () => {
    setLivenessConfirmed(true);
    setLivenessStepDone(true);
    alert("✓ Anti-spoofing tasks verified (No static layout or video projection detected).");
    
    // Finalize overall verification check
    setVerificationOutcome({
      match: true,
      confidence: verifyPatient.aadharNumber ? 98 : 88,
      method: scannedFingerprint ? "fingerprint" : "face"
    });
  };

  const handleGrantAccess = () => {
    // Add audit log of verification
    const log = {
      timestamp: new Date().toLocaleString(),
      verifiedBy: isAdmin ? "Admin (System Administrator)" : "Staff (Clinical Staff)",
      patientId: verifyPatient.hospitalId,
      patientName: verifyPatient.name,
      outcome: "IDENTITY CONFIRMED",
      confidence: verificationOutcome.confidence,
      method: verificationOutcome.method.toUpperCase()
    };
    setMergeAuditLogs([log, ...mergeAuditLogs]);
    alert(`Access Unlocked for ${verifyPatient.name}! Audit trail logged.`);
    setShowVerificationModal(false);
  };

  // Admin merge action
  const handleConfirmMerge = async () => {
    if (!selectedMergePair) return;
    if (!mergeNotes) {
      alert("Please provide audit notes justifying the record consolidation.");
      return;
    }

    try {
      const response = await mergePatients({
        survivorId: selectedMergePair.patientA.id,
        duplicateId: selectedMergePair.patientB.id,
        mergedBy: isAdmin ? "Admin" : "Staff",
        mergeNotes: mergeNotes
      });

      if (response.data.success) {
        alert(response.data.message);
        setSelectedMergePair(null);
        setMergeNotes("");
        loadPatients();
        loadDuplicates();
      }
    } catch (e) {
      console.error(e);
      alert("Failed to merge patient records.");
    }
  };

  const filteredPatients = patients.filter((patient) => {
    const query = searchTerm.toLowerCase();
    return (
      (patient.name || "").toLowerCase().includes(query) ||
      (patient.hospitalId || "").toLowerCase().includes(query) ||
      (patient.disease || "").toLowerCase().includes(query) ||
      (patient.phone || "").toLowerCase().includes(query)
    );
  });

  return (
    <div className="page-container">
      <h1 className="page-title" style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span>🏥 Patient Records & Identification Control</span>
        {/* Navigation Tabs */}
        <div className="tab-navigation-buttons" style={{ display: "flex", gap: "10px" }}>
          <button 
            className={`add-patient-btn ${activeTab === "list" ? "active-tab-btn" : ""}`}
            onClick={() => setActiveTab("list")}
            style={{ background: activeTab === "list" ? "#1e293b" : "rgba(148,163,184,0.3)" }}
          >
            Patients Registry
          </button>
          <button 
            className={`add-patient-btn ${activeTab === "search" ? "active-tab-btn" : ""}`}
            onClick={() => setActiveTab("search")}
            style={{ background: activeTab === "search" ? "#1e293b" : "rgba(148,163,184,0.3)" }}
          >
            AI Search & Verify
          </button>
          {isAdmin && (
            <button 
              className={`add-patient-btn ${activeTab === "duplicates" ? "active-tab-btn" : ""}`}
              onClick={() => setActiveTab("duplicates")}
              style={{ background: activeTab === "duplicates" ? "#b91c1c" : "rgba(148,163,184,0.3)", boxShadow: "none" }}
            >
              Merge Manager ({duplicatesList.length})
            </button>
          )}
        </div>
      </h1>

      {/* VIEW 1: STANDARD PATIENTS LIST */}
      {activeTab === "list" && (
        <div className="content-card">
          <div className="search-actions-bar">
            <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            {isStaff && (
              <button className="add-patient-btn" onClick={handleOpenAddModal}>
                + Register New Patient
              </button>
            )}
          </div>

          {loading ? (
            <div className="table-loading">Syncing records...</div>
          ) : (
            <table className="patients-table">
              <thead>
                <tr>
                  <th>Hospital ID</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Gender</th>
                  <th>Primary Phone</th>
                  <th>City</th>
                  <th>Disease</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-records-cell">No patients found in registry.</td>
                  </tr>
                ) : (
                  filteredPatients.map((patient) => (
                    <tr key={patient.id}>
                      <td><span className="patient-name-cell">{patient.hospitalId}</span></td>
                      <td className="patient-name-cell">{patient.firstName} {patient.lastName}</td>
                      <td>{patient.age}</td>
                      <td>{patient.gender}</td>
                      <td>{patient.phone}</td>
                      <td>{patient.city || "New York"}</td>
                      <td>{patient.disease}</td>
                      <td className="patient-actions">
                        <Button text="View" onClick={() => handleOpenViewModal(patient)} />
                        {isStaff && (
                          <>
                            <Button text="Edit" type="success" onClick={() => handleOpenEditModal(patient)} />
                            <Button text="Delete" type="danger" onClick={() => handleDeletePatient(patient.id, patient.name)} />
                          </>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* VIEW 2: FUZZY AI SEARCH & IDENTITY VERIFICATION SYSTEM */}
      {activeTab === "search" && (
        <div className="content-card" style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px" }}>
            <h2 style={{ color: "white", margin: 0 }}>🔍 Multi-Attribute Fuzzy Search</h2>
            <button className="add-patient-btn" onClick={handleBarcodeScanSim} style={{ background: "#4f46e5" }}>
              📷 Sim scan QR/Barcode card
            </button>
          </div>

          <form onSubmit={handleAdvancedSearch} className="patient-form" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "15px", marginBottom: "25px" }}>
            <div className="form-group">
              <label>Patient Name (Fuzzy Match)</label>
              <input 
                type="text" 
                value={advancedFilters.name} 
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, name: e.target.value })}
                placeholder="e.g. John Doe"
              />
            </div>
            <div className="form-group">
              <label>Date of Birth</label>
              <input 
                type="date" 
                value={advancedFilters.dob} 
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, dob: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Phone Number</label>
              <input 
                type="text" 
                value={advancedFilters.phone} 
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, phone: e.target.value })}
                placeholder="e.g. +9843546493"
              />
            </div>
            <div className="form-group">
              <label>Father's Name</label>
              <input 
                type="text" 
                value={advancedFilters.fatherName} 
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, fatherName: e.target.value })}
                placeholder="e.g. George Doe"
              />
            </div>
            <div className="form-group">
              <label>Aadhar (Last 4 digits)</label>
              <input 
                type="text" 
                value={advancedFilters.aadhar} 
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, aadhar: e.target.value })}
                placeholder="e.g. 9012"
              />
            </div>
            <div className="form-group">
              <label>City</label>
              <input 
                type="text" 
                value={advancedFilters.city} 
                onChange={(e) => setAdvancedFilters({ ...advancedFilters, city: e.target.value })}
                placeholder="e.g. New York"
              />
            </div>
            <div className="form-group" style={{ gridColumn: "1 / -1", display: "flex", justifyContent: "flex-end", marginTop: "10px" }}>
              <button type="submit" className="submit-form-btn" style={{ padding: "12px 28px", fontSize: "1rem" }}>
                Evaluate Search Matches
              </button>
            </div>
          </form>

          {/* SEARCH RESULTS COMPARISON CARDS */}
          {searchLoading ? (
            <div className="table-loading" style={{ color: "#cbd5e1" }}>Analyzing biographic similarities...</div>
          ) : (
            <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(360px, 1fr))" }}>
              {searchResults.map((res, index) => {
                const pat = res.patient;
                const isTopMatch = index === 0 && res.confidence >= 60;
                let cardBorder = "1px solid rgba(255, 255, 255, 0.1)";
                let cardBg = "#0f172a";
                if (isTopMatch) {
                  cardBorder = "2px solid #10b981";
                  cardBg = "#111c30";
                }

                return (
                  <div key={pat.id} style={{ border: cardBorder, background: cardBg, padding: "20px", borderRadius: "10px", display: "flex", flexDirection: "column", justifyBetween: "space-between" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px" }}>
                        <div>
                          <span style={{ fontSize: "0.75rem", background: "rgba(99, 102, 241, 0.2)", color: "#818cf8", padding: "3px 8px", borderRadius: "6px", fontWeight: "700" }}>
                            {pat.hospitalId}
                          </span>
                          <h3 style={{ margin: "5px 0 0 0", color: "white" }}>{pat.firstName} {pat.lastName}</h3>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <span style={{ 
                            fontSize: "0.8rem", 
                            fontWeight: "800", 
                            background: res.confidence >= 90 ? "#15803d" : res.confidence >= 75 ? "#b45309" : "#475569", 
                            color: "white", 
                            padding: "4px 8px", 
                            borderRadius: "6px" 
                          }}>
                            {res.confidence}% - {res.classification}
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
                        <div><strong>DOB/Age:</strong> {pat.dob ? pat.dob.split("T")[0] : ""} ({pat.age} yrs)</div>
                        <div><strong>Gender:</strong> {pat.gender}</div>
                        <div><strong>Phone:</strong> {pat.phone}</div>
                        <div><strong>City:</strong> {pat.city || "New York"}</div>
                        <div><strong>Father's Name:</strong> {pat.fatherName}</div>
                        <div><strong>Blood Group:</strong> {pat.bloodGroup || "O+"}</div>
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(255,255,255,0.05)", paddingTop: "12px" }}>
                      <span style={{ color: "#10b981", fontSize: "0.8rem", fontWeight: "600" }}>
                        {isTopMatch ? "★ RECOMMENDED MATCH" : ""}
                      </span>
                      <button className="submit-form-btn" onClick={() => startVerificationCheck(pat)} style={{ padding: "6px 14px", fontSize: "0.8rem" }}>
                        ✓ Select & Verify Identity
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* AUDIT LOG PANEL FOR VERIFICATIONS */}
          <div style={{ marginTop: "40px", borderTop: "1px solid rgba(255,255,255,0.1)", paddingTop: "25px" }}>
            <h3 style={{ color: "white", marginBottom: "15px" }}>📝 Identity Access Audit Logs</h3>
            <div style={{ background: "#0f172a", borderRadius: "8px", overflow: "hidden" }}>
              <table className="patients-table" style={{ border: "none", color: "#cbd5e1" }}>
                <thead style={{ background: "rgba(255,255,255,0.05)" }}>
                  <tr>
                    <th style={{ color: "#94a3b8" }}>Timestamp</th>
                    <th style={{ color: "#94a3b8" }}>Verified By</th>
                    <th style={{ color: "#94a3b8" }}>Patient ID</th>
                    <th style={{ color: "#94a3b8" }}>Patient Name</th>
                    <th style={{ color: "#94a3b8" }}>Verification Outcome</th>
                    <th style={{ color: "#94a3b8" }}>Confidence</th>
                    <th style={{ color: "#94a3b8" }}>Biometric Method</th>
                  </tr>
                </thead>
                <tbody>
                  {mergeAuditLogs.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ textAlign: "center", padding: "15px", color: "#64748b" }}>No verification attempts logged in this session.</td>
                    </tr>
                  ) : (
                    mergeAuditLogs.map((log, idx) => (
                      <tr key={idx} style={{ borderBottom: "1px solid rgba(255,255,255,0.05)" }}>
                        <td style={{ padding: "12px" }}>{log.timestamp}</td>
                        <td style={{ padding: "12px" }}>{log.verifiedBy}</td>
                        <td style={{ padding: "12px" }}>{log.patientId}</td>
                        <td style={{ padding: "12px" }}>{log.patientName}</td>
                        <td style={{ padding: "12px", color: "#10b981", fontWeight: "700" }}>{log.outcome}</td>
                        <td style={{ padding: "12px" }}>{log.confidence}%</td>
                        <td style={{ padding: "12px" }}>{log.method}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: DUPLICATE RESOLUTION PANEL */}
      {activeTab === "duplicates" && isAdmin && (
        <div className="content-card" style={{ background: "#1e293b", padding: "25px", borderRadius: "12px", border: "1px solid rgba(255,255,255,0.1)" }}>
          <h2 style={{ color: "white", marginBottom: "15px" }}>⚠️ Flagged Duplicate Records</h2>
          <p style={{ color: "#94a3b8", fontSize: "0.9rem", marginBottom: "25px" }}>
            The background checker automatically flags records matching on Name + primary contact details (Aadhar or DOB + Father combination). Use the panel to consolidate patient files.
          </p>

          <div style={{ display: "grid", gap: "20px" }}>
            {duplicatesList.map((pair, index) => (
              <div key={index} style={{ border: "1px solid rgba(255,255,255,0.1)", background: "#0f172a", padding: "20px", borderRadius: "10px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
                  <span style={{ background: "#ef4444", color: "white", padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700" }}>
                    Duplicate Match Trigger: {pair.reasons.join(", ")}
                  </span>
                  <button className="submit-form-btn" onClick={() => setSelectedMergePair(pair)} style={{ background: "#dc2626", padding: "8px 16px" }}>
                    🛠 Resolve & Merge
                  </button>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
                  {/* Record A */}
                  <div style={{ borderRight: "1px solid rgba(255,255,255,0.05)", paddingRight: "20px" }}>
                    <h4 style={{ color: "#60a5fa", margin: "0 0 10px 0" }}>Patient Record A: {pair.patientA.hospitalId}</h4>
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                      <div><strong>Full Name:</strong> {pair.patientA.name}</div>
                      <div><strong>Phone:</strong> {pair.patientA.phone}</div>
                      <div><strong>DOB:</strong> {pair.patientA.dob ? pair.patientA.dob.split("T")[0] : ""}</div>
                      <div><strong>Father:</strong> {pair.patientA.fatherName}</div>
                      <div><strong>Address:</strong> {pair.patientA.address}</div>
                    </div>
                  </div>
                  {/* Record B */}
                  <div>
                    <h4 style={{ color: "#f87171", margin: "0 0 10px 0" }}>Patient Record B (Duplicate): {pair.patientB.hospitalId}</h4>
                    <div style={{ fontSize: "0.85rem", color: "#cbd5e1" }}>
                      <div><strong>Full Name:</strong> {pair.patientB.name}</div>
                      <div><strong>Phone:</strong> {pair.patientB.phone}</div>
                      <div><strong>DOB:</strong> {pair.patientB.dob ? pair.patientB.dob.split("T")[0] : ""}</div>
                      <div><strong>Father:</strong> {pair.patientB.fatherName}</div>
                      <div><strong>Address:</strong> {pair.patientB.address}</div>
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {duplicatesList.length === 0 && (
              <div style={{ textAlign: "center", padding: "40px", color: "#64748b" }}>
                ✓ Database contains no matching duplicate record profiles at this time.
              </div>
            )}
          </div>
        </div>
      )}

      {/* MERGE DIALOG MODAL */}
      {selectedMergePair && (
        <Modal 
          isOpen={!!selectedMergePair} 
          onClose={() => setSelectedMergePair(null)} 
          title="Side-by-Side Duplicate Consolidation"
        >
          <div className="patient-details-view" style={{ maxWidth: "800px" }}>
            <p style={{ color: "#ef4444", fontWeight: "700" }}>
              ⚠️ WARNING: Record B will be permanently DELETED. All billing invoices and appointments associated with Record B will be re-assigned to Record A (Survivor).
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px", margin: "15px 0" }}>
              <div>
                <h3 style={{ color: "#10b981" }}>✓ SURVIVOR (Record A)</h3>
                <div style={{ border: "1px solid #10b981", padding: "15px", borderRadius: "8px", background: "#0f172a" }}>
                  <p><strong>Hospital ID:</strong> {selectedMergePair.patientA.hospitalId}</p>
                  <p><strong>Name:</strong> {selectedMergePair.patientA.name}</p>
                  <p><strong>Phone:</strong> {selectedMergePair.patientA.phone}</p>
                  <p><strong>Aadhar:</strong> {selectedMergePair.patientA.aadharNumber || "(Empty - will inherit)"}</p>
                  <p><strong>Disease:</strong> {selectedMergePair.patientA.disease}</p>
                </div>
              </div>

              <div>
                <h3 style={{ color: "#ef4444" }}>✗ DUPLICATE (Record B - To Delete)</h3>
                <div style={{ border: "1px solid #ef4444", padding: "15px", borderRadius: "8px", background: "#0f172a" }}>
                  <p><strong>Hospital ID:</strong> {selectedMergePair.patientB.hospitalId}</p>
                  <p><strong>Name:</strong> {selectedMergePair.patientB.name}</p>
                  <p><strong>Phone:</strong> {selectedMergePair.patientB.phone}</p>
                  <p><strong>Aadhar:</strong> {selectedMergePair.patientB.aadharNumber}</p>
                  <p><strong>Disease:</strong> {selectedMergePair.patientB.disease}</p>
                </div>
              </div>
            </div>

            <div className="form-group">
              <label style={{ color: "white" }}>Merge Approval Reason / Audit Notes *</label>
              <textarea 
                rows="3" 
                value={mergeNotes} 
                onChange={(e) => setMergeNotes(e.target.value)}
                placeholder="Consolidating duplicate registration from same day booking errors..."
                style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", color: "white" }}
              />
            </div>

            <div style={{ display: "flex", justifyContent: "flex-end", gap: "12px", marginTop: "20px" }}>
              <button className="cancel-form-btn" onClick={() => setSelectedMergePair(null)}>
                Cancel
              </button>
              <button className="submit-form-btn" onClick={() => {
                alert("Keeping records separate. Audit trail logged.");
                setSelectedMergePair(null);
              }} style={{ background: "#475569" }}>
                Keep Separate
              </button>
              <button className="submit-form-btn" onClick={handleConfirmMerge} style={{ background: "#ef4444" }}>
                Confirm Merge & Delete Duplicate
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* IDENTITY VERIFICATION CHECKLIST MODAL */}
      {showVerificationModal && verifyPatient && (
        <Modal 
          isOpen={showVerificationModal} 
          onClose={() => setShowVerificationModal(false)} 
          title={`🔒 Identity Verification Stepper: ${verifyPatient.name}`}
        >
          <div className="patient-details-view" style={{ maxWidth: "600px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
              <span style={{ fontSize: "1.1rem", fontWeight: "700" }}>
                Step {verificationStep} of 5
              </span>
              <span style={{ background: "#10b981", color: "white", padding: "3px 8px", borderRadius: "6px", fontSize: "0.8rem" }}>
                Level 2 Security
              </span>
            </div>

            {/* STEP 1: PHOTO ID VERIFICATION */}
            {verificationStep === 1 && (
              <div>
                <h3>Step 1: Face ID Comparison</h3>
                <div style={{ display: "flex", justifyBetween: "space-between", gap: "20px", marginBottom: "20px" }}>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "5px" }}>Stored Portrait ID</div>
                    <img 
                      src={verifyPatient.patientPhoto || "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=200&h=200&fit=crop"} 
                      alt="Stored Portrait" 
                      style={{ width: "120px", height: "120px", borderRadius: "10px", objectFit: "cover", border: "2px solid #6366f1" }} 
                    />
                  </div>
                  <div style={{ flex: 1, textAlign: "center" }}>
                    <div style={{ color: "#94a3b8", fontSize: "0.8rem", marginBottom: "5px" }}>Live Camera Feed</div>
                    <div style={{ width: "120px", height: "120px", margin: "0 auto", background: "#0f172a", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", border: "2px dashed #94a3b8" }}>
                      <span style={{ fontSize: "1.5rem" }}>📷</span>
                    </div>
                  </div>
                </div>
                <p style={{ textAlign: "center", fontSize: "0.9rem", color: "#cbd5e1" }}>
                  Does the patient face match the registered photo profile?
                </p>
                <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginTop: "15px" }}>
                  <button className="submit-form-btn" onClick={() => setVerificationStep(2)} style={{ background: "#10b981" }}>
                    Yes, Face Matches
                  </button>
                  <button className="cancel-form-btn" onClick={() => {
                    alert("Verification rejected. Access Blocked.");
                    setShowVerificationModal(false);
                  }}>
                    No, Reject
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: SMS OTP VERIFICATION */}
            {verificationStep === 2 && (
              <div>
                <h3>Step 2: Phone OTP Authentication</h3>
                <p style={{ fontSize: "0.9rem" }}>
                  Authenticate the patient's registered primary phone number <strong>{verifyPatient.phone}</strong>.
                </p>

                {!otpSent ? (
                  <button className="submit-form-btn" onClick={sendMockOtp} style={{ display: "block", margin: "15px auto" }}>
                    Send Verification Code
                  </button>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
                    <input 
                      type="text" 
                      placeholder="Enter 4-Digit OTP Code" 
                      value={enteredOtp} 
                      onChange={(e) => setEnteredOtp(e.target.value)}
                      style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", padding: "10px", borderRadius: "8px", color: "white", textAlign: "center", fontSize: "1.2rem", letterSpacing: "8px" }}
                    />
                    <button className="submit-form-btn" onClick={confirmMockOtp}>
                      Confirm SMS OTP
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 3: DEMOGRAPHICS DISAMBIGUATION CHECKBOXES */}
            {verificationStep === 3 && (
              <div>
                <h3>Step 3: Demographics Disambiguation</h3>
                <p style={{ fontSize: "0.85rem", color: "#94a3b8", marginBottom: "15px" }}>
                  Confirm key biographical questions with the patient to resolve record ambiguity.
                </p>

                <div style={{ display: "flex", flexDirection: "column", gap: "12px", background: "#0f172a", padding: "15px", borderRadius: "8px" }}>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={demographicsConfirmed.phone} 
                      onChange={(e) => setDemographicsConfirmed({ ...demographicsConfirmed, phone: e.target.checked })} 
                    />
                    <span>Phone number matches <strong>{verifyPatient.phone}</strong></span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={demographicsConfirmed.dob} 
                      onChange={(e) => setDemographicsConfirmed({ ...demographicsConfirmed, dob: e.target.checked })} 
                    />
                    <span>DOB matches <strong>{verifyPatient.dob ? verifyPatient.dob.split("T")[0] : ""}</strong></span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={demographicsConfirmed.city} 
                      onChange={(e) => setDemographicsConfirmed({ ...demographicsConfirmed, city: e.target.checked })} 
                    />
                    <span>Residential city matches <strong>{verifyPatient.city || "New York"}</strong></span>
                  </label>
                  <label style={{ display: "flex", alignItems: "center", gap: "10px", cursor: "pointer" }}>
                    <input 
                      type="checkbox" 
                      checked={demographicsConfirmed.aadharLast4} 
                      onChange={(e) => setDemographicsConfirmed({ ...demographicsConfirmed, aadharLast4: e.target.checked })} 
                    />
                    <span>Aadhar (Last 4) matches <strong>{verifyPatient.aadharNumber ? verifyPatient.aadharNumber.slice(-4) : "9012"}</strong></span>
                  </label>
                </div>

                <button 
                  className="submit-form-btn" 
                  disabled={!demographicsConfirmed.phone || !demographicsConfirmed.dob || !demographicsConfirmed.city || !demographicsConfirmed.aadharLast4}
                  onClick={() => setVerificationStep(4)} 
                  style={{ display: "block", width: "100%", marginTop: "20px", opacity: (!demographicsConfirmed.phone || !demographicsConfirmed.dob || !demographicsConfirmed.city || !demographicsConfirmed.aadharLast4) ? 0.5 : 1 }}
                >
                  Confirm Details Checklist
                </button>
              </div>
            )}

            {/* STEP 4: BIOMETRIC SCAN VERIFICATION */}
            {verificationStep === 4 && (
              <div>
                <h3>Step 4: Biometric Scan Verification</h3>
                <p style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
                  Integrate primary fingerprint scan (FIDO2 keys) or secondary face embedding comparison if hardware scanner is offline.
                </p>

                {scanningBiometric ? (
                  <div style={{ textAlign: "center", padding: "30px" }}>
                    <div className="table-loading" style={{ color: "white" }}>🔒 Communicating with authentication module...</div>
                  </div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: "15px", marginTop: "20px" }}>
                    <button className="submit-form-btn" onClick={simulateFingerprintCapture} style={{ background: "#10b981", fontSize: "1.1rem" }}>
                      ☝ Capture Fingerprint Template (Primary)
                    </button>
                    <button className="submit-form-btn" onClick={simulateFaceMatchingCapture} style={{ background: "#4f46e5" }}>
                      📷 Face Matching embedding (Secondary Fallback)
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* STEP 5: LIVENESS CHALLENGE */}
            {verificationStep === 5 && (
              <div>
                <h3>Step 5: Anti-Spoofing Liveness Challenge</h3>
                <p style={{ fontSize: "0.9rem", color: "#cbd5e1" }}>
                  Verify that the patient is a real, live person in front of the lens. Ask the patient to perform the following:
                </p>

                <div style={{ background: "#0f172a", border: "1.5px solid #6366f1", borderRadius: "8px", padding: "20px", textAlign: "center", margin: "15px 0" }}>
                  <h2 style={{ color: "#818cf8", margin: 0 }}>"{livenessTask}"</h2>
                </div>

                {!livenessStepDone ? (
                  <button className="submit-form-btn" onClick={handleLivenessChallenge} style={{ display: "block", width: "100%" }}>
                    ✓ Liveness Action Detected
                  </button>
                ) : (
                  <div style={{ textAlign: "center", padding: "10px" }}>
                    <div style={{ color: "#10b981", fontSize: "1.3rem", fontWeight: "800", marginBottom: "15px" }}>
                      ✓ IDENTITY CONFIRMED ({verificationOutcome?.confidence}% Score)
                    </div>
                    <button className="submit-form-btn" onClick={handleGrantAccess} style={{ display: "block", width: "100%", background: "#10b981" }}>
                      GRANT ACCESS TO MEDICAL RECORD
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </Modal>
      )}

      {/* VIEW MODAL (CRUD Legacy support) */}
      {showModal && modalMode === "view" && selectedPatient && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Patient Record Details">
          <div className="patient-details-view">
            <div style={{ textAlign: "center", marginBottom: "15px" }}>
              <img 
                src={selectedPatient.patientPhoto || "https://images.unsplash.com/photo-1579684389782-64d84b5e9053?q=80&w=200&h=200&fit=crop"} 
                alt="Portrait ID" 
                style={{ width: "120px", height: "120px", borderRadius: "50%", objectFit: "cover", border: "3px solid #6366f1" }} 
              />
              <h2 style={{ color: "white", margin: "5px 0 0 0" }}>{selectedPatient.name}</h2>
              <span style={{ fontSize: "0.8rem", color: "#94a3b8" }}>{selectedPatient.hospitalId}</span>
            </div>

            <div className="detail-item"><strong>Date of Birth:</strong> <span>{selectedPatient.dob ? selectedPatient.dob.split("T")[0] : ""}</span></div>
            <div className="detail-item"><strong>Age / Gender:</strong> <span>{selectedPatient.age} yrs / {selectedPatient.gender}</span></div>
            <div className="detail-item"><strong>Father's Name:</strong> <span>{selectedPatient.fatherName}</span></div>
            <div className="detail-item"><strong>Primary Phone:</strong> <span>{selectedPatient.phone}</span></div>
            <div className="detail-item"><strong>Emergency Secondary Phone:</strong> <span>{selectedPatient.phoneSecondary || "+1 555-987-654"}</span></div>
            <div className="detail-item"><strong>Aadhar ID:</strong> <span>{selectedPatient.aadharNumber || "1234 5678 9012"}</span></div>
            <div className="detail-item"><strong>PAN ID / Voter ID:</strong> <span>{selectedPatient.panCard || "ABCDE1234F"}</span></div>
            <div className="detail-item"><strong>Residential City:</strong> <span>{selectedPatient.city || "New York"}</span></div>
            <div className="detail-item"><strong>Current Address:</strong> <span>{selectedPatient.address}</span></div>
            <div className="detail-item"><strong>Diagnosed Disease:</strong> <span>{selectedPatient.disease}</span></div>

            {/* Scanned Documents Manager */}
            <div style={{ marginTop: "20px", borderTop: "1.5px solid rgba(255, 255, 255, 0.1)", paddingTop: "15px" }}>
              <h3 style={{ color: "white", marginBottom: "12px", fontSize: "1.1rem" }}>📄 Scanned Documents Manager</h3>
              
              {/* Upload Form */}
              {isStaff && (
                <form onSubmit={handleUploadDoc} style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                  <select 
                    value={newDocData.documentType} 
                    onChange={(e) => setNewDocData({ ...newDocData, documentType: e.target.value })}
                    style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "white", padding: "6px" }}
                  >
                    <option value="Aadhar">Aadhar Card</option>
                    <option value="PAN">PAN Card</option>
                    <option value="Voter ID">Voter ID</option>
                    <option value="Passport">Passport</option>
                    <option value="Insurance Card">Insurance Card</option>
                    <option value="Consent Form">Consent Form</option>
                  </select>
                  <input 
                    type="text" 
                    placeholder="Document Number" 
                    value={newDocData.documentNumber}
                    onChange={(e) => setNewDocData({ ...newDocData, documentNumber: e.target.value })}
                    style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "6px", color: "white", padding: "6px", flex: 1 }}
                  />
                  <button type="submit" className="submit-form-btn" style={{ padding: "6px 12px", background: "#4f46e5" }}>
                    Upload ID Scans
                  </button>
                </form>
              )}

              {/* Documents List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {patientDocs.map(doc => (
                  <div key={doc.id} style={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "8px", padding: "10px", display: "flex", flexDirection: "column", gap: "8px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: "700", color: "white" }}>{doc.documentType}</div>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Number: {doc.documentNumber} | Uploaded by: {doc.uploadedBy}</div>
                        {doc.verificationStatus === "Verified" && (
                          <div style={{ fontSize: "0.75rem", color: "#10b981" }}>✓ Verified by {doc.verifiedBy} on {doc.verificationDate ? doc.verificationDate.split("T")[0] : ""}</div>
                        )}
                      </div>
                      
                      <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                        <span style={{ 
                          fontSize: "0.75rem", 
                          padding: "3px 8px", 
                          borderRadius: "6px", 
                          fontWeight: "700",
                          background: doc.verificationStatus === "Verified" ? "#15803d" : doc.verificationStatus === "Rejected" ? "#b91c1c" : "#b45309",
                          color: "white"
                        }}>
                          {doc.verificationStatus}
                        </span>
                        
                        {isStaff && doc.verificationStatus === "Pending" && docVerifyForm !== doc.id && (
                          <button className="submit-form-btn" onClick={() => setDocVerifyForm(doc.id)} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#10b981" }}>
                            Verify
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Verify Credentials Sub-form */}
                    {docVerifyForm === doc.id && (
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px", background: "#1e293b", padding: "10px", borderRadius: "6px", width: "100%" }}>
                        <div style={{ fontSize: "0.8rem", color: "#94a3b8" }}>Clinical Employee Signature (Credentials verification):</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <input 
                            type="text" 
                            placeholder="Employee ID" 
                            value={verifyEmpId} 
                            onChange={(e) => setVerifyEmpId(e.target.value)} 
                            style={{ padding: "4px", fontSize: "0.8rem", flex: 1, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                          />
                          <input 
                            type="password" 
                            placeholder="Password" 
                            value={verifyPassword} 
                            onChange={(e) => setVerifyPassword(e.target.value)} 
                            style={{ padding: "4px", fontSize: "0.8rem", flex: 1, background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white" }}
                          />
                        </div>
                        <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
                          <button type="button" className="cancel-form-btn" onClick={() => setDocVerifyForm(null)} style={{ fontSize: "0.75rem", padding: "4px 8px" }}>
                            Cancel
                          </button>
                          <button type="button" className="submit-form-btn" onClick={() => handleVerifyDoc(doc.id, "Rejected")} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#ef4444" }}>
                            Reject
                          </button>
                          <button type="button" className="submit-form-btn" onClick={() => handleVerifyDoc(doc.id, "Verified")} style={{ fontSize: "0.75rem", padding: "4px 8px", background: "#10b981" }}>
                            Verify & Sign
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {patientDocs.length === 0 && (
                  <div style={{ fontSize: "0.85rem", color: "#64748b", textAlign: "center", padding: "10px" }}>
                    No identity scans loaded. Scanned credentials must be verified before record updates.
                  </div>
                )}
              </div>
            </div>
            
            <button className="modal-close-btn" onClick={() => setShowModal(false)}>Close Window</button>
          </div>
        </Modal>
      )}

      {/* ADD/EDIT MODAL (CRUD Legacy support) */}
      {showModal && (modalMode === "add" || modalMode === "edit") && (
        <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={modalMode === "add" ? "Register New Patient Record" : "Edit Patient Information"}>
          <form onSubmit={handleSavePatient} className="patient-form">
            {duplicateAlert && (
              <div style={{ background: "#7f1d1d", border: "1.5px solid #ef4444", padding: "15px", borderRadius: "8px", color: "#fca5a5" }}>
                <h4 style={{ margin: "0 0 5px 0", fontWeight: "700" }}>{duplicateAlert.message}</h4>
                <div style={{ fontSize: "0.85rem" }}>
                  <div><strong>Name:</strong> {duplicateAlert.name}</div>
                  <div><strong>Phone:</strong> {duplicateAlert.phone}</div>
                  <div><strong>Hospital ID:</strong> {duplicateAlert.hospitalId}</div>
                  <div><strong>Last Visit:</strong> {duplicateAlert.lastVisit}</div>
                </div>
                <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
                  <button type="button" className="submit-form-btn" onClick={() => {
                    const match = patients.find(p => p.hospitalId === duplicateAlert.hospitalId);
                    if (match) handleOpenViewModal(match);
                  }} style={{ background: "#10b981", fontSize: "0.75rem", padding: "6px 12px" }}>
                    View Existing Record
                  </button>
                  <button type="button" className="submit-form-btn" style={{ background: "#475569", fontSize: "0.75rem", padding: "6px 12px" }}>
                    Link To Existing Record
                  </button>
                  <button type="button" className="submit-form-btn" disabled style={{ background: "#ef4444", fontSize: "0.75rem", padding: "6px 12px", cursor: "not-allowed", opacity: 0.5 }}>
                    Create New Record (Blocked)
                  </button>
                </div>
              </div>
            )}

            <div className="form-group-row">
              <div className="form-group">
                <label>First Name *</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Middle Name</label>
                <input type="text" name="middleName" value={formData.middleName} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>Last Name *</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleFormChange} required />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Name Alias / Alternate Spellings</label>
                <input type="text" name="nameAlias" value={formData.nameAlias} onChange={handleFormChange} />
              </div>
              <div className="form-group" style={{ width: "90px", flex: "none" }}>
                <label>Age *</label>
                <input type="number" name="age" value={formData.age} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Gender *</label>
                <select name="gender" value={formData.gender} onChange={handleFormChange}>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </select>
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Primary Phone *</label>
                <input type="text" name="phone" value={formData.phone} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Secondary Phone</label>
                <input type="text" name="phoneSecondary" value={formData.phoneSecondary} onChange={handleFormChange} />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Primary Email *</label>
                <input type="email" name="email" value={formData.email} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Date of Birth *</label>
                <input type="date" name="dob" value={formData.dob} onChange={handleFormChange} required />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Father's Full Name *</label>
                <input type="text" name="fatherName" value={formData.fatherName} onChange={handleFormChange} required />
              </div>
              <div className="form-group">
                <label>Mother's Full Name</label>
                <input type="text" name="motherName" value={formData.motherName} onChange={handleFormChange} />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>Aadhar Card Number</label>
                <input type="text" name="aadharNumber" value={formData.aadharNumber} onChange={handleFormChange} maxLength="12" />
              </div>
              <div className="form-group">
                <label>PAN Card / Voter ID</label>
                <input type="text" name="panCard" value={formData.panCard} onChange={handleFormChange} />
              </div>
            </div>

            <div className="form-group-row">
              <div className="form-group">
                <label>City</label>
                <input type="text" name="city" value={formData.city} onChange={handleFormChange} />
              </div>
              <div className="form-group" style={{ width: "100px", flex: "none" }}>
                <label>Pin Code</label>
                <input type="text" name="pinCode" value={formData.pinCode} onChange={handleFormChange} />
              </div>
              <div className="form-group">
                <label>State</label>
                <input type="text" name="state" value={formData.state} onChange={handleFormChange} />
              </div>
            </div>

            <div className="form-group">
              <label>Current Address</label>
              <textarea name="address" rows="2" value={formData.address} onChange={handleFormChange}></textarea>
            </div>

            <div className="form-group">
              <label>Primary Disease / Admitting Symptom *</label>
              <input type="text" name="disease" value={formData.disease} onChange={handleFormChange} required />
            </div>

            <div className="form-actions">
              <button type="button" className="cancel-form-btn" onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button type="submit" className="submit-form-btn">
                {modalMode === "add" ? "Register Patient" : "Save Modifications"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Patients;