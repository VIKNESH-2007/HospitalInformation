import React, { useState, useEffect } from "react";
import "./ResourcesDashboard.css";
import { getRosters, getInventory, updateInventoryStock, getMaintenance, replaceRosterStaff } from "../services/ResourceService";

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

const Replacer = ({ staff, onReplace }) => {
  const [selected, setSelected] = useState("");
  let list = [];
  if (staff.staffName.startsWith("Dr.")) {
    list = ["Dr. Arthur Pendelton", "Dr. Robert Chen"];
  } else if (staff.staffName.startsWith("Nurse")) {
    list = ["Nurse Emily Watson", "Nurse James Kelly"];
  } else {
    list = ["Therapist Clara Oswald", "Therapist Liam Neeson"];
  }
  
  useEffect(() => {
    if (list.length > 0) setSelected(list[0]);
  }, [staff.staffName]);

  return (
    <div style={{ marginTop: "10px", display: "flex", gap: "8px", alignItems: "center" }}>
      <select 
        value={selected} 
        onChange={(e) => setSelected(e.target.value)}
        style={{ flex: 1, padding: "6px", borderRadius: "6px", border: "1px solid #cbd5e1", background: "white", color: "#334155", fontSize: "12px", fontWeight: "600" }}
      >
        {list.map(name => <option key={name} value={name}>{name}</option>)}
      </select>
      <button
        onClick={() => onReplace(staff.id, selected)}
        style={{ background: "#10b981", color: "white", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
      >
        Assign
      </button>
    </div>
  );
};

function ResourcesDashboard() {
  const [rosters, setRosters] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [maintenance, setMaintenance] = useState([]);

  const handleReplace = async (id, name) => {
    try {
      await replaceRosterStaff(id, name);
      alert(`Successfully assigned ${name} as replacement!`);
      loadAllResources();
    } catch (e) {
      console.error("Failed to replace staff:", e);
    }
  };

  useEffect(() => {
    // Danger alarm triggers if inventory stock is below 25% or staff is critically tardy (60m+)
    const hasCriticalInventory = inventory.some(item => (item.currentStock / item.totalCapacity) * 100 <= 25);
    const hasCriticalStaff = rosters.some(staff => staff.isLate && staff.tardinessMinutes >= 60);
    
    if (hasCriticalInventory || hasCriticalStaff) {
      playAlarmSound();
    }
  }, [inventory, rosters]);

  useEffect(() => {
    loadAllResources();
    const interval = setInterval(() => {
      loadAllResources();
    }, 10000); // Poll every 10s for real-time check-ins
    return () => clearInterval(interval);
  }, []);

  const loadAllResources = async () => {
    try {
      const rosterRes = await getRosters();
      const inventoryRes = await getInventory();
      const maintenanceRes = await getMaintenance();

      if (rosterRes.data) setRosters(rosterRes.data);
      if (inventoryRes.data) setInventory(inventoryRes.data);
      if (maintenanceRes.data) setMaintenance(maintenanceRes.data);
    } catch (e) {
      console.error("Failed to load dashboard resources:", e);
    }
  };

  const handleUpdateStock = async (id, currentStock) => {
    const amountStr = prompt("Enter new current stock level:", currentStock);
    if (amountStr === null) return;
    const amount = parseInt(amountStr);
    if (isNaN(amount) || amount < 0) {
      alert("Invalid stock level.");
      return;
    }

    try {
      await updateInventoryStock(id, amount);
      alert("Stock level updated!");
      loadAllResources();
    } catch (e) {
      console.error("Stock update error:", e);
    }
  };

  return (
    <div className="resources-page">
      <div className="resources-overlay"></div>
      <div className="resources-content">
        <h1 className="resources-title">📊 HIMS Resources & Operations Control</h1>

        {/* SECTION 1: CRITICAL RESOURCES */}
        <div className="resources-section">
          <h2>🏥 Critical Resource Inventory</h2>
          <p style={{ color: "#1e293b", margin: "-10px 0 20px 0", fontSize: "14px" }}>
            Real-time tracking of Oxygen, Blood pints, and IV Fluids. Reorders are auto-scheduled at safety limits.
          </p>

          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {inventory.map(item => {
              const percent = Math.floor((item.currentStock / item.totalCapacity) * 100);
              let isCritical = percent <= 10;
              let isWarning = percent <= 25;

              return (
                <div 
                  key={item.id} 
                  className={`resource-card ${isCritical ? "critical-card" : isWarning ? "warning-card" : ""}`}
                  style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>{item.resourceName}</span>
                    <button 
                      style={{ background: "#cbd5e1", color: "#334155", border: "none", padding: "6px 12px", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "12px" }}
                      onClick={() => handleUpdateStock(item.id, item.currentStock)}
                    >
                      Update
                    </button>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#475569", marginBottom: "8px" }}>
                    <span>Stock: {item.currentStock} / {item.totalCapacity} {item.unit}</span>
                    <span style={{ fontWeight: "700" }}>{percent}%</span>
                  </div>

                  <div style={{ background: "#e2e8f0", height: "10px", borderRadius: "5px", overflow: "hidden", marginBottom: "12px" }}>
                    <div style={{ width: `${percent}%`, background: isCritical ? "#ef4444" : isWarning ? "#f59e0b" : "#10b981", height: "100%" }}></div>
                  </div>

                  {isCritical ? (
                    <div style={{ background: "#fee2e2", borderLeft: "4px solid #ef4444", padding: "8px 12px", borderRadius: "6px", color: "#b91c1c", fontSize: "12px", fontWeight: "700" }}>
                      🚨 EMERGENCY: ICU Stocks critical! Emergency procurement trigger activated.
                    </div>
                  ) : isWarning ? (
                    <div style={{ background: "#fffbeb", borderLeft: "4px solid #d97706", padding: "8px 12px", borderRadius: "6px", color: "#b45309", fontSize: "12px", fontWeight: "700" }}>
                      ⚠️ WARNING: stock below safety threshold (25%). Auto-reorder ticket generated.
                    </div>
                  ) : (
                    <div style={{ background: "#f0fdf4", borderLeft: "4px solid #16a34a", padding: "8px 12px", borderRadius: "6px", color: "#166534", fontSize: "12px", fontWeight: "600" }}>
                      ✓ Stock levels nominal.
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 2: STAFF DUTY ROSTER */}
        <div className="resources-section" style={{ marginTop: "40px" }}>
          <h2>👩‍⚕️ Staff Shift Attendance & Replacement</h2>
          <p style={{ color: "#1e293b", margin: "-10px 0 20px 0", fontSize: "14px" }}>
            Monitors clock-in tardiness. HOD triggers level alerts for late arrival and selects available staff replacements.
          </p>

          <div style={{ display: "grid", gap: "20px", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))" }}>
            {rosters.map(staff => {
              let isLate = staff.isLate;
              let alertLevel = 0;
              let alertMsg = "";

              if (isLate) {
                if (staff.tardinessMinutes >= 60) {
                  alertLevel = 3;
                  alertMsg = `🚨 CRITICAL LATE (Level 3): ${staff.staffName} has not checked in for 60m of Shift! Alert escalated to HOD.`;
                } else if (staff.tardinessMinutes >= 30) {
                  alertLevel = 2;
                  alertMsg = `⚠️ DELAY (Level 2): ${staff.staffName} tardiness exceeded 30m.`;
                } else if (staff.tardinessMinutes >= 15) {
                  alertLevel = 1;
                  alertMsg = `⏰ DELAY (Level 1): ${staff.staffName} tardiness exceeded 15m.`;
                }
              }

              return (
                <div 
                  key={staff.id} 
                  className="resource-card" 
                  style={{ background: "#ffffff", padding: "20px", borderRadius: "12px", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)", display: "flex", flexDirection: "column", gap: "10px" }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "700", color: "#1e293b", fontSize: "16px" }}>{staff.staffName}</span>
                    <span className={`status-badge ${isLate ? "delayed" : staff.checkInTime ? "completed" : "scheduled"}`} style={{ fontSize: "12px" }}>
                      {isLate ? "Tardy" : staff.checkInTime ? "Check-in" : "On-Call"}
                    </span>
                  </div>

                  <div style={{ fontSize: "14px", color: "#475569" }}>
                    <div><strong>Shift:</strong> {staff.ShiftName} ({new Date(staff.shiftStart).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})</div>
                    <div><strong>Checked In:</strong> {staff.checkInTime ? new Date(staff.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "Not checked in yet"}</div>
                  </div>

                  {alertLevel > 0 && (
                    <div style={{ 
                      background: alertLevel === 3 ? "#fee2e2" : alertLevel === 2 ? "#ffedd5" : "#fef9c3", 
                      borderLeft: alertLevel === 3 ? "4px solid #ef4444" : alertLevel === 2 ? "4px solid #f97316" : "4px solid #eab308",
                      padding: "10px", 
                      borderRadius: "6px", 
                      color: alertLevel === 3 ? "#991b1b" : alertLevel === 2 ? "#9a3412" : "#854d0e",
                      fontSize: "12px",
                      fontWeight: "700",
                      lineHeight: "1.4"
                    }}>
                      {alertMsg}
                      {alertLevel >= 2 && (
                        <div style={{ marginTop: "8px", borderTop: "1px dashed rgba(0,0,0,0.1)", paddingTop: "5px", color: "#475569", fontWeight: "600" }}>
                          💡 Replacement Suggestion: Auto deploy On-call replacements immediately.
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* SECTION 3: PREVENTATIVE EQUIPMENT MAINTENANCE */}
        <div className="resources-section" style={{ marginTop: "40px" }}>
          <h2>🔧 Preventive Equipment Maintenance</h2>
          <p style={{ color: "#1e293b", margin: "-10px 0 20px 0", fontSize: "14px" }}>
            Scheduled maintenance timers for critical life-support and imaging machines. Warnings alert engineers.
          </p>

          <table className="resources-table" style={{ width: "100%", borderCollapse: "collapse", background: "#ffffff", borderRadius: "12px", overflow: "hidden", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.1)" }}>
            <thead>
              <tr style={{ background: "#cbd5e1", textAlign: "left" }}>
                <th style={{ padding: "15px" }}>Equipment Name</th>
                <th style={{ padding: "15px" }}>Last Service</th>
                <th style={{ padding: "15px" }}>Next Due</th>
                <th style={{ padding: "15px" }}>Status</th>
                <th style={{ padding: "15px" }}>Assigned Engineer</th>
              </tr>
            </thead>
            <tbody>
              {maintenance.map(eq => (
                <tr key={eq.id} style={{ borderBottom: "1px solid #e2e8f0" }}>
                  <td style={{ padding: "15px", fontWeight: "700", color: "#1e293b" }}>{eq.equipmentName}</td>
                  <td style={{ padding: "15px", color: "#475569" }}>{new Date(eq.lastServiceDate).toLocaleDateString()}</td>
                  <td style={{ padding: "15px", color: "#475569" }}>{new Date(eq.nextServiceDueDate).toLocaleDateString()}</td>
                  <td style={{ padding: "15px" }}>
                    <span className={`status-badge ${eq.status.toLowerCase().replace(" ", "")}`}>
                      {eq.status}
                    </span>
                  </td>
                  <td style={{ padding: "15px", color: "#475569" }}>{eq.assignedEngineer}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

export default ResourcesDashboard;
