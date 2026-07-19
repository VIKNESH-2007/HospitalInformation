import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./Appointments.css";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { 
  getAppointments, 
  bookAppointment, 
  reserveAppointmentSlot,
  updateAppointment, 
  cancelAppointment 
} from "../services/AppointmentsService";
import { getDoctors } from "../services/DoctorService";

function Appointments() {
    const { t } = useLanguage();
    const userString = localStorage.getItem("user");
    let userRole = "";
    if (userString) {
        try {
            const user = JSON.parse(userString);
            userRole = (user && user.role) ? user.role.toLowerCase() : "";
        } catch (e) {
            console.error("Error parsing user role for Appointments:", e);
        }
    }
    const isAllowedToBook = userRole === "user" || userRole === "staff";

    const [appointments, setAppointments] = useState([]);
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");
    const [showModal, setShowModal] = useState(false);
    const [selectedAppointment, setSelectedAppointment] = useState(null);

    const [newAppointment, setNewAppointment] = useState({
        patient: "",
        doctor: "",
        date: "",
        slot: "09:00 AM"
    });

    // Slot Locking States
    const [lockTimer, setLockTimer] = useState(0);
    const [reservedSlotData, setReservedSlotData] = useState(null);
    const [bookingMessage, setBookingMessage] = useState("");

    const availableSlots = [
        "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", 
        "11:30 AM", "12:00 PM", "02:00 PM", "02:30 PM", "03:00 PM", 
        "03:30 PM", "04:00 PM", "04:30 PM"
    ];

    useEffect(() => {
        loadAppointmentsList();
        loadDoctorsList();
    }, []);

    // Countdown Timer logic for 30s slot lock
    useEffect(() => {
        if (lockTimer > 0) {
            const interval = setInterval(() => {
                setLockTimer((prev) => prev - 1);
            }, 1000);
            return () => clearInterval(interval);
        } else if (lockTimer === 0 && reservedSlotData) {
            alert("⏳ Reservation Lock expired! The slot has been released. Please reserve again.");
            setReservedSlotData(null);
            setBookingMessage("");
        }
    }, [lockTimer, reservedSlotData]);

    const loadAppointmentsList = async () => {
        setLoading(true);
        try {
            const response = await getAppointments();
            if (response.data) {
                setAppointments(response.data);
            }
        } catch (e) {
            console.error("Failed to load appointments from server:", e);
        } finally {
            setLoading(false);
        }
    };

    const loadDoctorsList = async () => {
        try {
            const response = await getDoctors();
            if (response.data) {
                setDoctors(response.data);
                if (response.data.length > 0) {
                    setNewAppointment(prev => ({
                        ...prev,
                        doctor: response.data[0].name
                    }));
                }
            }
        } catch (e) {
            console.error("Failed to load doctors:", e);
        }
    };

    const isDoctorAvailableNow = (availability) => {
        if (!availability) return false;
        try {
            const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
            const currentDay = days[new Date().getDay()];
            
            // Check day availability
            let isDayOk = false;
            if (availability.includes("Mon-Fri")) {
                isDayOk = currentDay !== "Saturday" && currentDay !== "Sunday";
            } else if (availability.includes("Mon-Thu")) {
                isDayOk = ["Monday", "Tuesday", "Wednesday", "Thursday"].includes(currentDay);
            } else if (availability.includes("Tue-Fri")) {
                isDayOk = ["Tuesday", "Wednesday", "Thursday", "Friday"].includes(currentDay);
            } else {
                isDayOk = true; 
            }

            if (!isDayOk) return false;

            // Check hour availability
            const parts = availability.split(' ');
            if (parts.length < 2) return true;
            
            const timeRange = parts[1].split('-');
            const parseHour = (tStr) => {
                const isPm = tStr.includes("PM");
                const isAm = tStr.includes("AM");
                let numbers = tStr.replace("PM", "").replace("AM", "").trim();
                let hours = 0;
                let minutes = 0;
                if (numbers.includes(":")) {
                    const timeParts = numbers.split(':');
                    hours = parseInt(timeParts[0]);
                    minutes = parseInt(timeParts[1]);
                } else {
                    hours = parseInt(numbers);
                }
                if (isPm && hours < 12) hours += 12;
                if (isAm && hours === 12) hours = 0;
                return hours + (minutes / 60);
            };

            const start = parseHour(timeRange[0]);
            const end = parseHour(timeRange[1]);
            
            const now = new Date();
            const currentHour = now.getHours() + (now.getMinutes() / 60);
            
            return currentHour >= start && currentHour <= end;
        } catch (e) {
            return false;
        }
    };

    const handleView = (appointment) => {
        setSelectedAppointment(appointment);
        setShowModal(true);
    };

    const handleUpdate = async (appointment) => {
        if (appointment.status === "Completed") {
            alert("This appointment is already completed and cannot be modified.");
            return;
        }

        try {
            const response = await updateAppointment(appointment.id, {
                ...appointment,
                status: "Completed"
            });
            if (response.data) {
                setAppointments(
                    appointments.map((item) =>
                        item.id === appointment.id ? response.data : item
                    )
                );
                alert("Appointment status updated to Completed successfully!");
            }
        } catch (e) {
            console.error("Failed to update appointment status:", e);
            alert("Failed to update status on server.");
        }
    };

    const handleCancel = async (id) => {
        const confirmCancel = window.confirm(
            "Are you sure you want to cancel this appointment?"
        );

        if (confirmCancel) {
            try {
                await cancelAppointment(id);
                setAppointments(
                    appointments.filter((item) => item.id !== id)
                );
                alert("Appointment cancelled successfully!");
            } catch (e) {
                console.error("Failed to cancel appointment:", e);
                if (e.response && e.response.data) {
                    alert(e.response.data);
                } else {
                    alert("Failed to cancel appointment. Enforce > 24 hours cancellation rules.");
                }
            }
        }
    };

    // Helper to translate foreign input text (e.g. Tamil, Telugu, Kannada, Hindi) to English before database save
    const translateToEnglish = async (text) => {
        const hasNonAscii = Array.from(text || "").some(char => char.charCodeAt(0) > 127);
        if (!text || !hasNonAscii) {
            return text;
        }
        try {
            const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=auto|en`;
            const response = await fetch(url);
            const data = await response.json();
            if (data.responseStatus === 200 && data.responseData) {
                return data.responseData.translatedText;
            }
        } catch (error) {
            console.error("Auto translation error:", error);
        }
        return text;
    };

    // STEP 1 & 2: Click to lock/reserve slot for 30s
    const handleReserveSlot = async () => {
        if (!newAppointment.patient || !newAppointment.doctor || !newAppointment.date) {
            alert("Please fill all patient, doctor, and date fields first.");
            return;
        }

        // Client side hours check (8:00 AM - 9:00 PM)
        const currentHour = new Date().getHours();
        if (currentHour < 8 || currentHour >= 21) {
            alert("Booking is closed! Appointments can only be booked online between 8:00 AM and 9:00 PM.");
            return;
        }

        setLoading(true);
        setBookingMessage("");

        try {
            const finalPatient = await translateToEnglish(newAppointment.patient);

            const response = await reserveAppointmentSlot({
                patientName: finalPatient,
                doctorName: newAppointment.doctor,
                appointmentDate: newAppointment.date,
                timeSlot: newAppointment.slot,
                department: "General Medicine"
            });

            if (response.data) {
                setReservedSlotData(response.data);
                setLockTimer(30); 
                setBookingMessage("✓ Slot Reserved for 30 seconds!");
            }
        } catch (e) {
            console.error("Failed to reserve slot:", e);
            if (e.response && e.response.status === 409) {
                alert(e.response.data);
            } else if (e.response && e.response.data) {
                alert(e.response.data.message || e.response.data);
            } else {
                alert("Error reserving slot. Try choosing a different doctor or date.");
            }
        } finally {
            setLoading(false);
        }
    };

    // STEP 3 & 4: Confirm and save appointment (finalizes lock)
    const handleConfirmBooking = async () => {
        if (!reservedSlotData) return;

        setLoading(true);
        try {
            const response = await bookAppointment({
                patientName: reservedSlotData.patientName,
                doctorName: reservedSlotData.doctorName,
                appointmentDate: reservedSlotData.appointmentDate,
                timeSlot: reservedSlotData.timeSlot,
                department: reservedSlotData.department
            });

            if (response.data) {
                setAppointments([...appointments, response.data]);
                alert("✓ Appointment booked successfully with no conflicts!");
                setReservedSlotData(null);
                setLockTimer(0);
                setBookingMessage("");
                setNewAppointment({
                    patient: "",
                    doctor: doctors.length > 0 ? doctors[0].name : "",
                    date: "",
                    slot: "09:00 AM"
                });
            }
        } catch (e) {
            console.error("Booking confirmation error:", e);
            alert("Error confirming booking.");
        } finally {
            setLoading(false);
        }
    };

    const filteredAppointments = appointments.filter((appointment) =>
        (appointment.patientName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.doctorName || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (appointment.status || "").toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="appointment-page">
            <div className="appointment-content">
                <h1 className="appointment-title">
                    📅 {t("appointments")} Management
                </h1>

                {/* Available Doctors List Panel */}
                <div className="available-doctors-panel" style={{ background: "rgba(255, 255, 255, 0.95)", padding: "20px", borderRadius: "12px", marginBottom: "25px", border: "1px solid #cbd5e1" }}>
                    <h3 style={{ color: "#1e293b", margin: "0 0 15px 0", display: "flex", alignItems: "center", gap: "8px" }}>
                        🏥 Doctor Availability Schedules
                    </h3>
                    <div style={{ display: "grid", gap: "15px", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))" }}>
                        {doctors.map(doc => {
                            const isAvailable = isDoctorAvailableNow(doc.availability);
                            return (
                                <div key={doc.id} style={{ border: "1px solid #e2e8f0", padding: "12px", borderRadius: "8px", background: "#f8fafc" }}>
                                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                                        <span style={{ fontWeight: "700", color: "#1e293b" }}>{doc.name}</span>
                                        <span style={{ 
                                            background: isAvailable ? "#dcfce7" : "#cbd5e1", 
                                            color: isAvailable ? "#15803d" : "#475569", 
                                            padding: "3px 8px", 
                                            borderRadius: "6px", 
                                            fontSize: "0.75rem", 
                                            fontWeight: "700" 
                                        }}>
                                            {isAvailable ? "● Available Now" : "○ Away"}
                                        </span>
                                    </div>
                                    <div style={{ fontSize: "13px", color: "#64748b", marginTop: "5px" }}>
                                        <div><strong>Specialty:</strong> {doc.department}</div>
                                        <div><strong>Schedule:</strong> {doc.availability}</div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="appointment-header">
                    {isAllowedToBook ? (
                        <div className="booking-status-box">
                            {reservedSlotData ? (
                                <button className="book-btn confirm-booking-btn" onClick={handleConfirmBooking}>
                                    Confirm & Pay (Confirm inside {lockTimer}s)
                                </button>
                            ) : (
                                <button className="book-btn" onClick={handleReserveSlot}>
                                    + Reserve Slot
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="booking-restricted-badge">
                            🔒 Booking restricted to Staff & Patients
                        </div>
                    )}

                    <input
                        type="text"
                        placeholder="Search appointments..."
                        className="search-box"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {isAllowedToBook && (
                    <>
                        <div className="booking-hours-info">
                            🕒 <strong>Booking Hours:</strong> 8:00 AM - 9:00 PM (Daily)
                            {lockTimer > 0 && (
                                <span className="lock-active-badge" style={{ marginLeft: "15px", background: "#f59e0b", color: "white", padding: "4px 8px", borderRadius: "6px", fontSize: "0.8rem", fontWeight: "700" }}>
                                    ⏳ Lock Active: {lockTimer}s remaining
                                </span>
                            )}
                            {bookingMessage && (
                                <span className="booking-message-badge" style={{ marginLeft: "15px", color: "#10b981", fontWeight: "700" }}>
                                    {bookingMessage}
                                </span>
                            )}
                        </div>
                        <div className="booking-form" style={{ display: "flex", gap: "15px", marginBottom: "25px" }}>
                            <input
                                type="text"
                                placeholder="Patient Name"
                                disabled={!!reservedSlotData}
                                value={newAppointment.patient}
                                onChange={(e) => setNewAppointment({ ...newAppointment, patient: e.target.value })}
                                style={{ flex: 1 }}
                            />
                            <select
                                disabled={!!reservedSlotData}
                                value={newAppointment.doctor}
                                onChange={(e) => setNewAppointment({ ...newAppointment, doctor: e.target.value })}
                                style={{ padding: "14px", borderRadius: "10px", border: "none", flex: 1 }}
                            >
                                {doctors.map(doc => (
                                    <option key={doc.id} value={doc.name}>{doc.name} ({doc.department})</option>
                                ))}
                            </select>
                            <input
                                type="date"
                                disabled={!!reservedSlotData}
                                value={newAppointment.date}
                                onChange={(e) => setNewAppointment({ ...newAppointment, date: e.target.value })}
                                style={{ width: "160px" }}
                            />
                            <select
                                disabled={!!reservedSlotData}
                                value={newAppointment.slot}
                                onChange={(e) => setNewAppointment({ ...newAppointment, slot: e.target.value })}
                                style={{ padding: "14px", borderRadius: "10px", border: "none" }}
                            >
                                {availableSlots.map((s) => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>
                    </>
                )}

                {loading ? (
                    <div className="table-loading">Syncing details...</div>
                ) : (
                    <>
                        {/* TABLE 1: ACTIVE APPOINTMENTS */}
                        <h2 style={{ color: "white", fontSize: "1.5rem", margin: "25px 0 15px 0", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "5px" }}>
                            📅 Active Appointments
                        </h2>
                        <table className="appointment-table" style={{ marginBottom: "40px" }}>
                            <thead>
                                <tr>
                                    <th>{t("id")}</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Status</th>
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.filter(a => a.status !== "Completed").length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-records-cell">No active appointments scheduled.</td>
                                    </tr>
                                ) : (
                                    filteredAppointments.filter(a => a.status !== "Completed").map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>{appointment.id}</td>
                                            <td>{appointment.patientName}</td>
                                            <td>{appointment.doctorName}</td>
                                            <td>{appointment.appointmentDate ? appointment.appointmentDate.split("T")[0] : ""}</td>
                                            <td>{appointment.timeSlot}</td>
                                            <td>
                                                <span className={`status-badge ${appointment.status.toLowerCase()}`}>
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    text={t("view")}
                                                    onClick={() => handleView(appointment)}
                                                />
                                                <Button
                                                    text="Toggle Status"
                                                    type="success"
                                                    onClick={() => handleUpdate(appointment)}
                                                />
                                                <Button
                                                    text="Cancel"
                                                    type="danger"
                                                    onClick={() => handleCancel(appointment.id)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>

                        {/* TABLE 2: COMPLETED APPOINTMENTS */}
                        <h2 style={{ color: "white", fontSize: "1.5rem", margin: "25px 0 15px 0", borderBottom: "1px solid rgba(255,255,255,0.2)", paddingBottom: "5px" }}>
                            ✓ Completed Appointments History
                        </h2>
                        <table className="appointment-table">
                            <thead>
                                <tr>
                                    <th>{t("id")}</th>
                                    <th>Patient</th>
                                    <th>Doctor</th>
                                    <th>Date</th>
                                    <th>Time Slot</th>
                                    <th>Status</th>
                                    <th>{t("actions")}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredAppointments.filter(a => a.status === "Completed").length === 0 ? (
                                    <tr>
                                        <td colSpan="7" className="no-records-cell">No completed appointments found.</td>
                                    </tr>
                                ) : (
                                    filteredAppointments.filter(a => a.status === "Completed").map((appointment) => (
                                        <tr key={appointment.id}>
                                            <td>{appointment.id}</td>
                                            <td>{appointment.patientName}</td>
                                            <td>{appointment.doctorName}</td>
                                            <td>{appointment.appointmentDate ? appointment.appointmentDate.split("T")[0] : ""}</td>
                                            <td>{appointment.timeSlot}</td>
                                            <td>
                                                <span className="status-badge completed">
                                                    {appointment.status}
                                                </span>
                                            </td>
                                            <td>
                                                <Button
                                                    text={t("view")}
                                                    onClick={() => handleView(appointment)}
                                                />
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </>
                )}
            </div>

            <Modal
                isOpen={showModal}
                onClose={() => setShowModal(false)}
                title="Appointment Details"
            >
                {selectedAppointment && (
                    <>
                        <p><strong>Appointment ID:</strong> {selectedAppointment.id}</p>
                        <p><strong>Patient Name:</strong> {selectedAppointment.patientName}</p>
                        <p><strong>Doctor Name:</strong> {selectedAppointment.doctorName}</p>
                        <p><strong>Department:</strong> {selectedAppointment.department}</p>
                        <p><strong>Date:</strong> {selectedAppointment.appointmentDate ? selectedAppointment.appointmentDate.split("T")[0] : ""}</p>
                        <p><strong>Time Slot:</strong> {selectedAppointment.timeSlot}</p>
                        <p><strong>Status:</strong> {selectedAppointment.status}</p>
                    </>
                )}
            </Modal>
        </div>
    );
}

export default Appointments;