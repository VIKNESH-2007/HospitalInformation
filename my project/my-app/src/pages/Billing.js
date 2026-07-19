import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./Billing.css";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { getBills, createBill, validateBill, approveBill, updateBill } from "../services/BillingService";
import { getPatientPrescriptions } from "../services/PrescriptionService";

function Billing() {
  const { t } = useLanguage();
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(false);

  // Core Form inputs
  const [newBill, setNewBill] = useState({
    patient: "",
    consultation: "",
    medicine: "",
    lab: "",
    medicineName: "",
    medicineQuantity: ""
  });

  // Prescription validation states
  const [activePrescriptions, setActivePrescriptions] = useState([]);
  const [selectedPrescription, setSelectedPrescription] = useState(null);

  // Multi-step Wizard States
  const [showWizard, setShowWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [validationReport, setValidationReport] = useState(null);
  const [selectedPatientFromDup, setSelectedPatientFromDup] = useState(null);
  const [overrideReasonText, setOverrideReasonText] = useState("");
  const [selectedExistingBillAction, setSelectedExistingBillAction] = useState("");

  // Draft review states
  const [showDraftModal, setShowDraftModal] = useState(false);
  const [draftToReview, setDraftToReview] = useState(null);
  const [draftEdits, setDraftEdits] = useState({
    consultationFee: 0,
    medicineFee: 0,
    labFee: 0
  });

  useEffect(() => {
    loadBillsList();
  }, []);

  // Fetch prescriptions dynamically when patient name changes
  useEffect(() => {
    if (newBill.patient.trim().length > 2) {
      const delayDebounce = setTimeout(async () => {
        try {
          const res = await getPatientPrescriptions(newBill.patient);
          if (res.data && res.data.length > 0) {
            setActivePrescriptions(res.data);
          } else {
            setActivePrescriptions([]);
          }
        } catch (err) {
          console.error("Prescriptions loading error:", err);
        }
      }, 500);
      return () => clearTimeout(delayDebounce);
    } else {
      setActivePrescriptions([]);
    }
  }, [newBill.patient]);

  const loadBillsList = async () => {
    setLoading(true);
    try {
      const response = await getBills();
      if (response.data) {
        setBills(response.data);
      }
    } catch (e) {
      console.error("Failed to load bills from server:", e);
    } finally {
      setLoading(false);
    }
  };

  const viewBill = (bill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const printBill = (bill) => {
    const printWindow = window.open("", "", "width=700,height=600");
    printWindow.document.write(`
      <html>
      <head>
        <title>Hospital Bill Receipt</title>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; padding: 40px; color: #334155; }
          .header { text-align: center; margin-bottom: 30px; }
          .header h1 { margin: 0; color: #1e3a8a; }
          .header p { margin: 5px 0; color: #64748b; }
          .divider { border-top: 2px solid #e2e8f0; margin: 20px 0; }
          .details-table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          .details-table th, .details-table td { padding: 12px; text-align: left; border-bottom: 1px solid #e2e8f0; }
          .details-table th { background: #f8fafc; color: #475569; }
          .total-row { font-size: 1.25rem; font-weight: bold; color: #0f172a; }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NovaCare HIMS</h1>
          <p>Super Speciality Medical Center & Laboratory Services</p>
          <p>Tax Invoice / Bill Receipt</p>
        </div>
        <div class="divider"></div>
        <p><strong>Receipt ID:</strong> REC-2026-${bill.id}</p>
        <p><strong>Patient Name:</strong> ${bill.patientName}</p>
        <p><strong>Attending Doctor:</strong> ${bill.doctorName}</p>
        <p><strong>Billing Date:</strong> ${new Date(bill.billingDate).toLocaleDateString()}</p>
        <p><strong>Invoice Status:</strong> ${bill.status?.toUpperCase() || "PAID"}</p>
        <div class="divider"></div>
        <table class="details-table">
          <thead>
            <tr>
              <th>Description</th>
              <th>Amount (₹)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Physician Consultation Charges</td>
              <td>₹${bill.consultationFee}</td>
            </tr>
            <tr>
              <td>Pharmacy / Dispensed Medication Fee (${bill.medicineName || "General"})</td>
              <td>₹${bill.medicineFee}</td>
            </tr>
            <tr>
              <td>Diagnostic Laboratory & Tests Charge</td>
              <td>₹${bill.labFee}</td>
            </tr>
            <tr class="total-row">
              <td>Total Amount Paid</td>
              <td>₹${bill.totalAmount}</td>
            </tr>
          </tbody>
        </table>
        <div class="divider"></div>
        <p style="text-align: center; color: #64748b; font-size: 0.9rem; margin-top: 40px;">
          Thank you for choosing NovaCare. For billing queries, call +1 555-NOVACARE.
        </p>
      </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  const handleSelectPrescription = (rx) => {
    setSelectedPrescription(rx);
    setNewBill({
      ...newBill,
      medicineName: rx.medicationName,
      medicineQuantity: rx.prescribedQty,
      medicine: 50 // default pharmacy standard
    });
  };

  // Launch billing check wizard
  const triggerBillingValidation = async (e) => {
    e.preventDefault();

    if (!newBill.patient || !newBill.consultation || !newBill.medicine || !newBill.lab) {
      alert("Please fill in patient name, consultation fee, medicine cost, and lab fee first.");
      return;
    }

    try {
      const payload = {
        patientName: newBill.patient,
        doctorName: selectedPrescription ? selectedPrescription.doctorName : "General Practice",
        consultationFee: Number(newBill.consultation),
        medicineFee: Number(newBill.medicine),
        labFee: Number(newBill.lab),
        medicineName: newBill.medicineName || "General Meds",
        medicineQuantity: newBill.medicineQuantity ? Number(newBill.medicineQuantity) : 0
      };

      const response = await validateBill(payload);
      if (response.data) {
        setValidationReport(response.data);
        setSelectedPatientFromDup(null);
        setOverrideReasonText("");
        setSelectedExistingBillAction("");
        
        // Open Stepper Modal
        setWizardStep(1);
        setShowWizard(true);
      }
    } catch (err) {
      console.error(err);
      alert("Billing validation service returned an error.");
    }
  };

  // Progress Stepper steps
  const nextWizardStep = () => {
    if (wizardStep === 1) {
      if (!validationReport.patientExists) {
        alert("Patient must exist to generate bills. Please correct or save as Draft.");
        return;
      }
      if (validationReport.isDuplicatePatient && !selectedPatientFromDup) {
        alert("Please confirm which patient record to apply this bill to.");
        return;
      }
      setWizardStep(2);
    } 
    else if (wizardStep === 2) {
      setWizardStep(3);
    } 
    else if (wizardStep === 3) {
      const hasMismatch = validationReport.consultationMismatch || 
                          validationReport.medicineMismatch || 
                          validationReport.labMismatch;
      if (hasMismatch && !overrideReasonText.trim()) {
        alert("A variance override justification notes is required for amount mismatches.");
        return;
      }
      setWizardStep(4);
    }
  };

  const executeBillGeneration = async (finalStatus = "Paid") => {
    try {
      const total = Number(newBill.consultation) + Number(newBill.medicine) + Number(newBill.lab);
      const payload = {
        patientName: selectedPatientFromDup ? selectedPatientFromDup.name : newBill.patient,
        consultationFee: Number(newBill.consultation),
        medicineFee: Number(newBill.medicine),
        labFee: Number(newBill.lab),
        roomCharge: 0,
        totalAmount: total,
        doctorName: selectedPrescription ? selectedPrescription.doctorName : "General Practice",
        paymentMethod: "Cash",
        paymentStatus: finalStatus === "Paid" ? "Paid" : "Pending",
        status: finalStatus, // Draft, Paid
        medicineName: newBill.medicineName || "General Meds",
        medicineQuantity: newBill.medicineQuantity ? Number(newBill.medicineQuantity) : 0,
        prescriptionId: selectedPrescription ? selectedPrescription.id : null,
        isOverridden: overrideReasonText.trim().length > 0,
        overrideReason: overrideReasonText
      };

      const res = await createBill(payload);
      if (res.data) {
        setBills([...bills, res.data]);
        alert(`Bill generated successfully! Status: ${finalStatus.toUpperCase()}`);
        setShowWizard(false);
        // Reset inputs
        setNewBill({
          patient: "",
          consultation: "",
          medicine: "",
          lab: "",
          medicineName: "",
          medicineQuantity: ""
        });
        setSelectedPrescription(null);
        setActivePrescriptions([]);
      }
    } catch (err) {
      console.error(err);
      alert("Error writing bill record to Database.");
    }
  };

  // Open Draft reviewer
  const openDraftReview = (draft) => {
    setDraftToReview(draft);
    setDraftEdits({
      consultationFee: draft.consultationFee,
      medicineFee: draft.medicineFee,
      labFee: draft.labFee
    });
    setShowDraftModal(true);
  };

  const handleApproveDraft = async () => {
    try {
      // 1. Update bill details first
      const updatedTotal = Number(draftEdits.consultationFee) + Number(draftEdits.medicineFee) + Number(draftEdits.labFee);
      await updateBill(draftToReview.id, {
        ...draftToReview,
        consultationFee: Number(draftEdits.consultationFee),
        medicineFee: Number(draftEdits.medicineFee),
        labFee: Number(draftEdits.labFee),
        totalAmount: updatedTotal,
        status: "Paid",
        paymentStatus: "Paid"
      });

      // 2. Call approve status transition
      await approveBill(draftToReview.id);
      
      alert("✓ Draft bill finalized and approved!");
      setShowDraftModal(false);
      loadBillsList();
    } catch (err) {
      console.error(err);
      alert("Re-approval failed.");
    }
  };

  const filteredBills = bills.filter(
    (bill) =>
      (bill.patientName || "").toLowerCase().includes(search.toLowerCase()) ||
      (bill.id || "").toString().includes(search)
  );

  const activeBills = filteredBills.filter(b => b.status !== "Draft");
  const draftBills = filteredBills.filter(b => b.status === "Draft");

  return (
    <div className="billing-page">
      <div className="billing-overlay"></div>
      <div className="billing-content">
        <h1 className="billing-title">
          💳 {t("billing")} Management
        </h1>

        <div className="billing-top">
          <button className="generate-btn" onClick={triggerBillingValidation}>
            + Verify & Generate Bill
          </button>

          <input
            type="text"
            placeholder="Search by Bill ID or Patient"
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {/* Display Active Prescriptions for Auto Reconciliation */}
        {activePrescriptions.length > 0 && (
          <div className="active-prescriptions-block" style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", padding: "15px", borderRadius: "10px", marginBottom: "20px" }}>
            <h4 style={{ color: "#34d399", margin: "0 0 10px 0" }}>💊 Active Prescriptions Found for Patient</h4>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              {activePrescriptions.map(rx => (
                <div 
                  key={rx.id} 
                  className={`rx-item ${selectedPrescription?.id === rx.id ? "selected" : ""}`}
                  style={{ 
                    background: selectedPrescription?.id === rx.id ? "#10b981" : "rgba(255,255,255,0.05)", 
                    padding: "8px 12px", 
                    border: "1.5px solid #10b981", 
                    color: "white",
                    borderRadius: "8px", 
                    cursor: "pointer", 
                    fontSize: "13px" 
                  }}
                  onClick={() => handleSelectPrescription(rx)}
                >
                  <strong>{rx.medicationName}</strong> (Qty: {rx.prescribedQty}) - {rx.doctorName}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="billing-form">
          <input
            type="text"
            placeholder="Patient Name"
            value={newBill.patient}
            onChange={(e) => setNewBill({ ...newBill, patient: e.target.value })}
          />
          <input
            type="number"
            placeholder="Consultation Fee"
            value={newBill.consultation}
            onChange={(e) => setNewBill({ ...newBill, consultation: e.target.value })}
          />
          <input
            type="number"
            placeholder="Medicine Cost"
            value={newBill.medicine}
            onChange={(e) => setNewBill({ ...newBill, medicine: e.target.value })}
          />
          <input
            type="number"
            placeholder="Lab Cost"
            value={newBill.lab}
            onChange={(e) => setNewBill({ ...newBill, lab: e.target.value })}
          />
        </div>

        {/* Detailed Medication Billing Input Fields */}
        {selectedPrescription && (
          <div className="reconciliation-inputs-row" style={{ display: "flex", gap: "15px", marginTop: "15px", marginBottom: "25px" }}>
            <div style={{ flex: 1 }}>
              <label style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>Dispensed Medication</label>
              <input
                type="text"
                disabled
                value={newBill.medicineName}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", marginTop: "5px", background: "rgba(255,255,255,0.1)", color: "white" }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ color: "white", fontSize: "13px", fontWeight: "600" }}>Dispensed Quantity</label>
              <input
                type="number"
                value={newBill.medicineQuantity}
                onChange={(e) => setNewBill({ ...newBill, medicineQuantity: e.target.value })}
                style={{ width: "100%", padding: "12px", borderRadius: "10px", border: "none", marginTop: "5px", background: "rgba(255,255,255,0.05)", color: "white" }}
              />
            </div>
          </div>
        )}

        <div className="billing-total-preview" style={{ marginBottom: "25px", color: "white", fontWeight: "700", fontSize: "1.1rem" }}>
          Total Preview: ₹{(Number(newBill.consultation || 0) + Number(newBill.medicine || 0) + Number(newBill.lab || 0)).toLocaleString("en-IN")}
        </div>

        {loading ? (
          <div className="table-loading">Loading bills...</div>
        ) : (
          <>
            <h2 style={{ color: "white", marginBottom: "15px", fontSize: "1.2rem" }}>📅 Active Billing Records</h2>
            <table className="billing-table" style={{ marginBottom: "40px" }}>
              <thead>
                <tr>
                  <th>Bill ID</th>
                  <th>Patient</th>
                  <th>Consultation</th>
                  <th>Medicine</th>
                  <th>Lab</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {activeBills.length === 0 ? (
                  <tr>
                    <td colSpan="8" className="no-records-cell">No billing invoices found.</td>
                  </tr>
                ) : (
                  activeBills.map((bill) => (
                    <tr key={bill.id}>
                      <td>{bill.id}</td>
                      <td>{bill.patientName}</td>
                      <td>₹{bill.consultationFee}</td>
                      <td>₹{bill.medicineFee}</td>
                      <td>₹{bill.labFee}</td>
                      <td>₹{bill.totalAmount}</td>
                      <td>
                        <span style={{ padding: "3px 8px", background: "#15803d", borderRadius: "6px", fontSize: "0.8rem", color: "white", fontWeight: "700" }}>
                          {bill.status || "Paid"}
                        </span>
                      </td>
                      <td>
                        <Button text={t("view")} onClick={() => viewBill(bill)} />
                        <Button text="Print" type="success" onClick={() => printBill(bill)} />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* DRAFT BILLS MANAGER REVIEW SECTION */}
            <div style={{ borderTop: "1.5px solid rgba(255,255,255,0.1)", paddingTop: "25px" }}>
              <h2 style={{ color: "#fb923c", marginBottom: "15px", fontSize: "1.2rem" }}>⚠️ Draft Manager Queue (Requires Verification Approval)</h2>
              <table className="billing-table">
                <thead>
                  <tr style={{ background: "rgba(251, 146, 60, 0.1)" }}>
                    <th>Draft ID</th>
                    <th>Patient</th>
                    <th>Consultation</th>
                    <th>Medicine</th>
                    <th>Lab</th>
                    <th>Total</th>
                    <th>Reason / Variance Notes</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {draftBills.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="no-records-cell" style={{ color: "#94a3b8" }}>No draft records requiring approval. All billing reports clear.</td>
                    </tr>
                  ) : (
                    draftBills.map((bill) => (
                      <tr key={bill.id} style={{ borderLeft: "4px solid #fb923c" }}>
                        <td>{bill.id}</td>
                        <td>{bill.patientName}</td>
                        <td>₹{bill.consultationFee}</td>
                        <td>₹{bill.medicineFee}</td>
                        <td>₹{bill.labFee}</td>
                        <td>₹{bill.totalAmount}</td>
                        <td style={{ color: "#cbd5e1", fontSize: "0.8rem", maxWidth: "200px", overflow: "hidden", textOverflow: "ellipsis" }}>
                          {bill.overrideReason || "Unapproved Variance Mismatch"}
                        </td>
                        <td>
                          <Button text="Review & Approve" type="danger" onClick={() => openDraftReview(bill)} style={{ background: "#fb923c", border: "none" }} />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* MULTI-STEP BILLING VERIFICATION STEPPER MODAL */}
      {showWizard && validationReport && (
        <Modal isOpen={showWizard} onClose={() => setShowWizard(false)} title="Billing Verification Compliance Check">
          <div className="stepper-wizard-content" style={{ color: "white" }}>
            
            {/* Steps Progress Indicator */}
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", borderBottom: "1px solid rgba(255,255,255,0.1)", paddingBottom: "10px" }}>
              <span style={{ color: wizardStep >= 1 ? "#34d399" : "#64748b", fontWeight: "700" }}>1. Patient Info</span>
              <span style={{ color: wizardStep >= 2 ? "#34d399" : "#64748b", fontWeight: "700" }}>2. Duplicate Check</span>
              <span style={{ color: wizardStep >= 3 ? "#34d399" : "#64748b", fontWeight: "700" }}>3. Fee Reconciliation</span>
              <span style={{ color: wizardStep >= 4 ? "#34d399" : "#64748b", fontWeight: "700" }}>4. Finalize Invoice</span>
            </div>

            {/* STEP 1: PATIENT RECORD VALIDATION */}
            {wizardStep === 1 && (
              <div>
                <h3>Step 1: Patient Registration Verification</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{validationReport.patientMessage}</p>

                {validationReport.isDuplicatePatient && (
                  <div style={{ background: "rgba(239, 68, 68, 0.1)", border: "1.5px solid #ef4444", borderRadius: "8px", padding: "15px", margin: "15px 0" }}>
                    <div style={{ color: "#f87171", fontWeight: "700", marginBottom: "10px" }}>⚠️ Duplicate Patients found. Please select which patient record to apply:</div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                      {validationReport.patientCandidates.map(c => (
                        <div key={c.id} style={{ background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <strong>{c.name}</strong> ({c.hospitalId}) - DOB: {c.dob ? c.dob.split("T")[0] : ""}
                            <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Phone: {c.phone}</div>
                          </div>
                          <button 
                            className="submit-form-btn" 
                            onClick={() => setSelectedPatientFromDup(c)}
                            style={{ fontSize: "0.75rem", padding: "4px 8px", background: selectedPatientFromDup?.id === c.id ? "#10b981" : "#4f46e5" }}
                          >
                            {selectedPatientFromDup?.id === c.id ? "✓ Selected" : "Select Record"}
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button className="cancel-form-btn" onClick={() => setShowWizard(false)}>Cancel</button>
                  {!validationReport.patientExists ? (
                    <button className="submit-form-btn" style={{ background: "#fb923c" }} onClick={() => executeBillGeneration("Draft")}>
                      Save as Draft (Missing Patient)
                    </button>
                  ) : (
                    <button className="submit-form-btn" onClick={nextWizardStep}>Proceed to Step 2</button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 2: DUPLICATE BILL CHECK */}
            {wizardStep === 2 && (
              <div>
                <h3>Step 2: Same-day Duplicate Bill Check</h3>
                <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>{validationReport.existingBillMessage}</p>

                {validationReport.hasExistingBill && (
                  <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1.5px solid #f59e0b", padding: "15px", borderRadius: "8px", margin: "15px 0" }}>
                    <div style={{ color: "#fbbf24", fontWeight: "700", marginBottom: "10px" }}>A bill is already active for this patient today. What would you like to do?</div>
                    <div style={{ display: "flex", gap: "10px" }}>
                      <button 
                        className="submit-form-btn" 
                        style={{ background: selectedExistingBillAction === "override" ? "#10b981" : "rgba(255,255,255,0.1)" }}
                        onClick={() => setSelectedExistingBillAction("override")}
                      >
                        Generate New Bill anyway
                      </button>
                      <button 
                        className="submit-form-btn" 
                        style={{ background: selectedExistingBillAction === "draft" ? "#fb923c" : "rgba(255,255,255,0.1)" }}
                        onClick={() => setSelectedExistingBillAction("draft")}
                      >
                        Mark as Draft (Hold for check)
                      </button>
                    </div>
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button className="cancel-form-btn" onClick={() => setWizardStep(1)}>Back</button>
                  {validationReport.hasExistingBill && !selectedExistingBillAction ? (
                    <button className="submit-form-btn" disabled style={{ opacity: 0.5, cursor: "not-allowed" }}>Proceed to Step 3</button>
                  ) : (
                    <button className="submit-form-btn" onClick={() => {
                      if (selectedExistingBillAction === "draft") {
                        executeBillGeneration("Draft");
                      } else {
                        nextWizardStep();
                      }
                    }}>
                      Proceed to Step 3
                    </button>
                  )}
                </div>
              </div>
            )}

            {/* STEP 3: AMOUNT CROSS-REFERENCE & RECONCILIATION */}
            {wizardStep === 3 && (
              <div>
                <h3>Step 3: Database Rates Reconciliation Check</h3>
                <p style={{ color: "#cbd5e1", fontSize: "0.85rem", marginBottom: "15px" }}>
                  NovaCare system verifies entries against doctor consultations, pharmacy listings, and laboratory catalogs to avoid billing leakage.
                </p>

                <div className="variance-table" style={{ display: "flex", flexDirection: "column", gap: "8px", margin: "15px 0" }}>
                  
                  {/* Consultation Charge */}
                  <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", borderLeft: validationReport.consultationMismatch ? "4px solid #ef4444" : "4px solid #10b981" }}>
                    <div>
                      <div><strong>Consultation Fee</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Expected: ₹{validationReport.expectedConsultation} | Entered: ₹{newBill.consultation}</div>
                    </div>
                    {validationReport.consultationMismatch ? <span style={{ color: "#ef4444", fontWeight: "700" }}>⚠️ Variance Mismatch</span> : <span style={{ color: "#10b981" }}>✓ Reconciled</span>}
                  </div>

                  {/* Medicine Charge */}
                  <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", borderLeft: validationReport.medicineMismatch ? "4px solid #ef4444" : "4px solid #10b981" }}>
                    <div>
                      <div><strong>Medicine Charge</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Expected: ₹{validationReport.expectedMedicine} | Entered: ₹{newBill.medicine}</div>
                    </div>
                    {validationReport.medicineMismatch ? <span style={{ color: "#ef4444", fontWeight: "700" }}>⚠️ Variance Mismatch</span> : <span style={{ color: "#10b981" }}>✓ Reconciled</span>}
                  </div>

                  {/* Lab Charge */}
                  <div style={{ display: "flex", justifyContent: "space-between", background: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "6px", borderLeft: validationReport.labMismatch ? "4px solid #ef4444" : "4px solid #10b981" }}>
                    <div>
                      <div><strong>Lab Fee</strong></div>
                      <div style={{ fontSize: "0.8rem", color: "#64748b" }}>Expected (Lab reports catalog): ₹{validationReport.expectedLab} | Entered: ₹{newBill.lab}</div>
                    </div>
                    {validationReport.labMismatch ? <span style={{ color: "#ef4444", fontWeight: "700" }}>⚠️ Variance Mismatch</span> : <span style={{ color: "#10b981" }}>✓ Reconciled</span>}
                  </div>
                </div>

                {/* If mismatch is found, require text reason */}
                {(validationReport.consultationMismatch || validationReport.medicineMismatch || validationReport.labMismatch) && (
                  <div style={{ marginTop: "15px" }}>
                    <label style={{ color: "#fca5a5", fontSize: "0.85rem", fontWeight: "700" }}>⚠️ Fee Variance Detected. Please provide override reason:</label>
                    <textarea 
                      placeholder="Enter Clinical Manager override code or justification reason..." 
                      value={overrideReasonText}
                      onChange={(e) => setOverrideReasonText(e.target.value)}
                      rows="3"
                      style={{ width: "100%", background: "#0f172a", border: "1px solid rgba(255,255,255,0.15)", borderRadius: "8px", padding: "10px", color: "white", marginTop: "5px" }}
                    />
                  </div>
                )}

                <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
                  <button className="cancel-form-btn" onClick={() => setWizardStep(2)}>Back</button>
                  <button className="submit-form-btn" style={{ background: "#fb923c" }} onClick={() => executeBillGeneration("Draft")}>
                    Save as Draft (Verify Later)
                  </button>
                  <button className="submit-form-btn" onClick={nextWizardStep}>
                    Proceed to Confirmation
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: FINAL CHECKLIST SUMMARY */}
            {wizardStep === 4 && (
              <div>
                <h3>Step 4: Final Invoice Compliance Checklist</h3>
                
                <div style={{ background: "rgba(16, 185, 129, 0.1)", border: "1px solid #10b981", borderRadius: "10px", padding: "20px", margin: "15px 0" }}>
                  <h4 style={{ color: "#34d399", margin: "0 0 15px 0" }}>✓ Verification Complete</h4>
                  <ul style={{ listStyleType: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px" }}>
                    <li>✓ Patient Record: <strong>{selectedPatientFromDup ? selectedPatientFromDup.name : newBill.patient}</strong> verified</li>
                    <li>✓ Same-day Conflict: Clear</li>
                    <li>✓ Rates Reconciled: Completed {overrideReasonText ? "(Bypassed with override notes)" : ""}</li>
                    <li style={{ borderTop: "1.5px solid rgba(255,255,255,0.1)", paddingTop: "10px", marginTop: "5px", fontSize: "1.1rem" }}>
                      Grand Total Invoice: <strong>₹{(Number(newBill.consultation) + Number(newBill.medicine) + Number(newBill.lab)).toLocaleString("en-IN")}</strong>
                    </li>
                  </ul>
                </div>

                <div style={{ display: "flex", gap: "10px", marginTop: "25px" }}>
                  <button className="cancel-form-btn" onClick={() => setWizardStep(3)}>Back</button>
                  <button className="submit-form-btn" onClick={() => executeBillGeneration("Paid")} style={{ background: "#10b981" }}>
                    ✓ Generate & Sign Bill
                  </button>
                </div>
              </div>
            )}

          </div>
        </Modal>
      )}

      {/* DRAFT REVIEW & APPROVAL MODAL */}
      {showDraftModal && draftToReview && (
        <Modal isOpen={showDraftModal} onClose={() => setShowDraftModal(false)} title="Correct & Approve Draft Bill">
          <div style={{ color: "white", display: "flex", flexDirection: "column", gap: "15px" }}>
            <div>
              <strong>Draft Bill ID:</strong> {draftToReview.id} <br/>
              <strong>Patient Name:</strong> {draftToReview.patientName} <br/>
              <strong>Date Generated:</strong> {new Date(draftToReview.billingDate).toLocaleDateString()}
            </div>

            <div style={{ border: "1.5px dashed #fb923c", padding: "10px", borderRadius: "8px", background: "rgba(251, 146, 60, 0.05)", fontSize: "0.85rem", color: "#fb923c" }}>
              <strong>Compliance Mismatch Reason:</strong> {draftToReview.overrideReason || "Unapproved Variance rates entered."}
            </div>

            <div>
              <label>Consultation Fee (₹)</label>
              <input 
                type="number" 
                value={draftEdits.consultationFee}
                onChange={(e) => setDraftEdits({ ...draftEdits, consultationFee: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white", marginTop: "5px" }}
              />
            </div>

            <div>
              <label>Medicine Fee (₹)</label>
              <input 
                type="number" 
                value={draftEdits.medicineFee}
                onChange={(e) => setDraftEdits({ ...draftEdits, medicineFee: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white", marginTop: "5px" }}
              />
            </div>

            <div>
              <label>Lab Fee (₹)</label>
              <input 
                type="number" 
                value={draftEdits.labFee}
                onChange={(e) => setDraftEdits({ ...draftEdits, labFee: e.target.value })}
                style={{ width: "100%", padding: "10px", borderRadius: "6px", background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", color: "white", marginTop: "5px" }}
              />
            </div>

            <div style={{ fontSize: "1.1rem", fontWeight: "700", marginTop: "10px" }}>
              Recalculated Total: ₹{(Number(draftEdits.consultationFee) + Number(draftEdits.medicineFee) + Number(draftEdits.labFee)).toLocaleString("en-IN")}
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "20px" }}>
              <button className="cancel-form-btn" onClick={() => setShowDraftModal(false)}>Cancel Review</button>
              <button className="submit-form-btn" onClick={handleApproveDraft} style={{ background: "#10b981" }}>
                ✓ Save Corrections & Approve Bill
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* VIEW MODAL (CRUD Legacy support) */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Bill Details">
        {selectedBill && (
          <div style={{ lineHeight: "1.8", color: "white" }}>
            <p><strong>Bill ID:</strong> {selectedBill.id}</p>
            <p><strong>Patient Name:</strong> {selectedBill.patientName}</p>
            <p><strong>Date:</strong> {new Date(selectedBill.billingDate).toLocaleDateString()}</p>
            <hr style={{ borderColor: "rgba(255,255,255,0.1)" }}/>
            <p><strong>Consultation:</strong> ₹{selectedBill.consultationFee}</p>
            <p><strong>Lab Cost:</strong> ₹{selectedBill.labFee}</p>
            <p><strong>Medicine Charge:</strong> ₹{selectedBill.medicineFee} ({selectedBill.medicineName || "N/A"} - Qty: {selectedBill.medicineQuantity || 0})</p>
            {selectedBill.isOverridden && (
              <p style={{ color: "#fb923c" }}><strong>* Override:</strong> {selectedBill.overrideReason}</p>
            )}
            <hr style={{ borderColor: "rgba(255,255,255,0.1)" }}/>
            <h3>Total: ₹{selectedBill.totalAmount}</h3>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Billing;