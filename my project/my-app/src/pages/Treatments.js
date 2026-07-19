import React, { useState, useEffect } from "react";
import "./Treatments.css";
import Modal from "../components/Modal";
import { 
  getTreatments, 
  createTreatment, 
  startTreatment, 
  completeTreatment, 
  updateTreatment 
} from "../services/TreatmentService";

const playAlarmSound = () => {
  try {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;
    const audioCtx = new AudioContext();
    
    const duration = 1.5;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    
    osc.type = "sawtooth";
    
    // Alternating fast siren sweeps (danger pitch modulation)
    osc.frequency.setValueAtTime(600, audioCtx.currentTime);
    for (let t = 0; t < duration; t += 0.3) {
      osc.frequency.linearRampToValueAtTime(1000, audioCtx.currentTime + t + 0.15);
      osc.frequency.linearRampToValueAtTime(600, audioCtx.currentTime + t + 0.3);
    }
    
    gain.gain.setValueAtTime(0.01, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.7, audioCtx.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + duration);
    
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    
    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {
    console.warn("Audio Context block: Click on page to allow sound.", e);
  }
};

function Treatments() {
  const [treatments, setTreatments] = useState([]);
  
  useEffect(() => {
    const hasCritical = treatments.some(t => t.alertLevel === 3);
    if (hasCritical) {
      playAlarmSound();
    }
  }, [treatments]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [selectedTx, setSelectedTx] = useState(null);
  const [delayReason, setDelayReason] = useState("");

  const [newTx, setNewTx] = useState({
    patientName: "",
    treatmentType: "Consultation",
    expectedDuration: "",
    assignedDoctor: ""
  });

  const loadTreatmentsList = async () => {
    try {
      const response = await getTreatments();
      if (response.data) {
        setAppointmentsWithDurations(response.data);
      }
    } catch (e) {
      console.error("Failed to load treatments:", e);
    }
  };

  // Fetch treatments on load and poll every 10 seconds to update live countdown/delay status
  useEffect(() => {
    loadTreatmentsList();
    const interval = setInterval(() => {
      loadTreatmentsList();
    }, 10000);
    return () => clearInterval(interval);
  }, []);


  const setAppointmentsWithDurations = (data) => {
    // Add computed live fields
    const updated = data.map(item => {
      if ((item.status === "Active" || item.status === "Delayed") && item.actualStartTime) {
        const elapsed = Math.floor((new Date() - new Date(item.actualStartTime)) / 60000);
        const percent = Math.min(100, Math.floor((elapsed / item.expectedDuration) * 100));
        let alertLevel = 0;
        let alertMessage = "";

        if (elapsed > item.expectedDuration) {
          const delay = elapsed - item.expectedDuration;
          if (delay >= 30) {
            alertLevel = 3;
            alertMessage = "🚨 CRITICAL DELAY ALERT (Level 3): Notification dispatched to HOD / Chief Admin!";
          } else if (delay >= 15) {
            alertLevel = 2;
            alertMessage = "⚠️ DELAY ALERT (Level 2): WhatsApp/SMS notification dispatched to Family Members.";
          } else if (delay >= 5) {
            alertLevel = 1;
            alertMessage = "⏰ DELAY WARNING (Level 1): Procedure delay logged.";
          }
        }

        return { ...item, elapsed, percent, alertLevel, alertMessage };
      }
      return item;
    });
    setTreatments(updated);
  };

  const handleStart = async (id) => {
    setLoading(true);
    try {
      await startTreatment(id);
      alert("Procedure/Consultation started!");
      loadTreatmentsList();
    } catch (e) {
      console.error("Start treatment error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleComplete = async (id) => {
    setLoading(true);
    try {
      await completeTreatment(id);
      alert("Procedure/Consultation completed!");
      loadTreatmentsList();
    } catch (e) {
      console.error("Complete treatment error:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDelayModal = (tx) => {
    setSelectedTx(tx);
    setDelayReason(tx.delayReason || "");
    setShowModal(true);
  };

  const handleSaveDelayReason = async () => {
    if (!selectedTx) return;
    try {
      await updateTreatment(selectedTx.id, {
        ...selectedTx,
        delayReason: delayReason
      });
      alert("Delay details saved successfully!");
      setShowModal(false);
      loadTreatmentsList();
    } catch (e) {
      console.error("Error saving delay details:", e);
    }
  };

  const handleCreateTreatment = async (e) => {
    e.preventDefault();
    if (!newTx.patientName || !newTx.expectedDuration || !newTx.assignedDoctor) {
      alert("Please fill all fields");
      return;
    }

    try {
      await createTreatment({
        patientName: newTx.patientName,
        treatmentType: newTx.treatmentType,
        expectedDuration: parseInt(newTx.expectedDuration),
        assignedDoctor: newTx.assignedDoctor,
        status: "Scheduled"
      });
      alert("Treatment Scheduled successfully!");
      setNewTx({
        patientName: "",
        treatmentType: "Consultation",
        expectedDuration: "",
        assignedDoctor: ""
      });
      loadTreatmentsList();
    } catch (e) {
      console.error("Create treatment error:", e);
    }
  };

  return (
    <div className="treatments-page">
      <div className="treatments-overlay"></div>
      <div className="treatments-content">
        <h1 className="treatments-title">⏱️ Real-Time Treatment & Delay Tracker</h1>

        <div className="tracker-form-container" style={{ background: "rgba(255,255,255,0.1)", backdropFilter: "blur(10px)", padding: "20px", borderRadius: "12px", marginBottom: "30px", border: "1px solid rgba(255,255,255,0.2)" }}>
          <h3 style={{ color: "white", margin: "0 0 15px 0" }}>Schedule New Procedure / Consultation</h3>
          <form onSubmit={handleCreateTreatment} style={{ display: "flex", gap: "15px", flexWrap: "wrap" }}>
            <input
              type="text"
              placeholder="Patient Name"
              value={newTx.patientName}
              onChange={(e) => setNewTx({ ...newTx, patientName: e.target.value })}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none" }}
            />
            <select
              value={newTx.treatmentType}
              onChange={(e) => setNewTx({ ...newTx, treatmentType: e.target.value })}
              style={{ padding: "12px", borderRadius: "8px", border: "none" }}
            >
              <option value="Consultation">Consultation</option>
              <option value="Surgery">Surgery</option>
              <option value="Lab Test">Lab Test</option>
              <option value="Therapy">Therapy</option>
            </select>
            <input
              type="number"
              placeholder="Expected Duration (mins)"
              value={newTx.expectedDuration}
              onChange={(e) => setNewTx({ ...newTx, expectedDuration: e.target.value })}
              style={{ width: "180px", padding: "12px", borderRadius: "8px", border: "none" }}
            />
            <input
              type="text"
              placeholder="Assigned Specialist"
              value={newTx.assignedDoctor}
              onChange={(e) => setNewTx({ ...newTx, assignedDoctor: e.target.value })}
              style={{ flex: 1, padding: "12px", borderRadius: "8px", border: "none" }}
            />
            <button type="submit" style={{ background: "#0ea5e9", color: "white", padding: "12px 20px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
              Schedule
            </button>
          </form>
        </div>

        {/* Live delay alerts layout */}
        {treatments.filter(t => t.alertLevel > 0).map(tx => (
          <div 
            key={`alert-${tx.id}`} 
            className={`alert-banner level-${tx.alertLevel}`}
            style={{ 
              background: tx.alertLevel === 3 ? "#fee2e2" : tx.alertLevel === 2 ? "#ffedd5" : "#fef9c3", 
              borderLeft: tx.alertLevel === 3 ? "5px solid #ef4444" : tx.alertLevel === 2 ? "5px solid #f97316" : "5px solid #eab308",
              padding: "15px", 
              borderRadius: "8px", 
              marginBottom: "15px", 
              color: tx.alertLevel === 3 ? "#991b1b" : tx.alertLevel === 2 ? "#9a3412" : "#854d0e",
              fontWeight: "600",
              fontSize: "14px"
            }}
          >
            {tx.alertMessage} (Patient: {tx.patientName} - Doctor: {tx.assignedDoctor} | Delay: {tx.elapsed - tx.expectedDuration} mins)
          </div>
        ))}

        <div className="procedures-list" style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))" }}>
          {treatments.map((tx) => (
            <div 
              key={tx.id} 
              className={`procedure-card ${tx.status.toLowerCase()}`}
              style={{ 
                background: "rgba(255,255,255,0.9)", 
                borderRadius: "12px", 
                padding: "20px", 
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                display: "flex",
                flexDirection: "column",
                gap: "10px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>{tx.patientName}</span>
                <span className={`status-badge ${tx.status.toLowerCase()}`} style={{ fontSize: "12px" }}>
                  {tx.status}
                </span>
              </div>
              <div style={{ fontSize: "14px", color: "#64748b" }}>
                <div><strong>Procedure:</strong> {tx.treatmentType}</div>
                <div><strong>Specialist:</strong> {tx.assignedDoctor}</div>
                <div><strong>Scheduled:</strong> {tx.scheduledTime ? new Date(tx.scheduledTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "N/A"}</div>
                <div><strong>Target Duration:</strong> {tx.expectedDuration} mins</div>
              </div>

              {/* Progress Tracker Bar */}
              {(tx.status === "Active" || tx.status === "Delayed") && (
                <div style={{ margin: "10px 0" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "#475569", marginBottom: "5px" }}>
                    <span>Elapsed: {tx.elapsed} mins</span>
                    <span>{tx.percent}%</span>
                  </div>
                  <div style={{ background: "#e2e8f0", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div style={{ width: `${tx.percent}%`, background: tx.status === "Delayed" ? "#ef4444" : "#0ea5e9", height: "100%" }}></div>
                  </div>
                </div>
              )}

              {tx.delayReason && (
                <div style={{ background: "#f8fafc", padding: "8px", borderRadius: "6px", fontSize: "12px", color: "#475569", borderLeft: "3px solid #64748b" }}>
                  <strong>Delay Note:</strong> {tx.delayReason}
                </div>
              )}

              <div style={{ display: "flex", gap: "10px", marginTop: "auto", paddingTop: "10px" }}>
                {tx.status === "Scheduled" && (
                  <button 
                    style={{ flex: 1, background: "#10b981", color: "white", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                    onClick={() => handleStart(tx.id)}
                  >
                    Start
                  </button>
                )}
                {tx.status === "Active" && (
                  <button 
                    style={{ flex: 1, background: "#0ea5e9", color: "white", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                    onClick={() => handleComplete(tx.id)}
                  >
                    Complete
                  </button>
                )}
                {tx.status === "Delayed" && (
                  <>
                    <button 
                      style={{ flex: 1, background: "#0ea5e9", color: "white", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                      onClick={() => handleComplete(tx.id)}
                    >
                      Complete
                    </button>
                    <button 
                      style={{ flex: 1, background: "#f97316", color: "white", border: "none", padding: "8px", borderRadius: "6px", cursor: "pointer", fontWeight: "600" }}
                      onClick={() => handleOpenDelayModal(tx)}
                    >
                      Log Delay
                    </button>
                  </>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Log Delay Details"
      >
        {selectedTx && (
          <div style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <p>Specify the reason for the delays in <strong>{selectedTx.patientName}'s</strong> {selectedTx.treatmentType}:</p>
            <textarea
              rows="3"
              value={delayReason}
              onChange={(e) => setDelayReason(e.target.value)}
              placeholder="Enter delay details (e.g., Awaiting lab results, specialist consultation delay...)"
              style={{ width: "100%", padding: "10px", borderRadius: "8px", border: "1px solid #cbd5e1" }}
            />
            <div style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
              <button style={{ background: "#cbd5e1", color: "#334155", padding: "10px 15px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }} onClick={() => setShowModal(false)}>
                Cancel
              </button>
              <button style={{ background: "#f97316", color: "white", padding: "10px 15px", border: "none", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }} onClick={handleSaveDelayReason}>
                Save Reason
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

export default Treatments;
