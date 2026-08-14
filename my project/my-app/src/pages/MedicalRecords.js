import { useState } from "react";
import "./MedicalRecords.css";

function MedicalRecords() {
    const records = [
        {
            id: "P001",
            name: "John Doe",
            age: 28,
            gender: "Male",
            doctor: "Dr. Smith",
            disease: "Hypertension",
            medicine: "Amlodipine 5mg",
            date: "08 Jul 2026"
        },
        {
            id: "P002",
            name: "Saran",
            age: 20,
            gender: "Male",
            doctor: "Dr. David",
            disease: "Fever",
            medicine: "Paracetamol",
            date: "10 Jul 2026"
        },
        {
            id: "P003",
            name: "Nithin",
            age: 19,
            gender: "Male",
            doctor: "Dr. Kumar",
            disease: "Diabetes",
            medicine: "Metformin",
            date: "12 Jul 2026"
        },
        {
            id: "P004",
            name: "Priya",
            age: 25,
            gender: "Female",
            doctor: "Dr. John",
            disease: "Migraine",
            medicine: "Sumatriptan",
            date: "15 Jul 2026"
        },
        {
            id: "P005",
            name: "Vasan",
            age: 24,
            gender: "Male",
            doctor: "Dr. Robert Chen",
            disease: "General Checkup",
            medicine: "Multivitamins",
            date: "14 Aug 2026"
        }
    ];

    const [selectedRecord, setSelectedRecord] = useState(null);

    // Retrieve logged-in user profile details
    const userString = localStorage.getItem("user");
    let userRole = "";
    let userFullName = "";
    if (userString) {
        try {
            const user = JSON.parse(userString);
            userRole = (user && user.role) ? user.role.toLowerCase() : "";
            userFullName = (user && user.fullName) ? user.fullName.toLowerCase() : "";
        } catch (e) {
            console.error("Error parsing user for MedicalRecords:", e);
        }
    }

    // Role-based visibility: Admins and Staff view all. Patients (Users) view ONLY their own.
    const isStaffOrAdmin = userRole === "admin" || userRole === "staff";
    const visibleRecords = isStaffOrAdmin 
        ? records 
        : records.filter(r => r.name.toLowerCase() === userFullName);

    return (
        <div className="records-container">
            <h1 className="records-title">Medical Records</h1>

            <div className="records-grid">
                {visibleRecords.length === 0 ? (
                    <div className="no-records-badge" style={{ color: "white", background: "rgba(30,41,59,0.8)", padding: "20px 40px", borderRadius: "12px", fontSize: "1.1rem" }}>
                        🔒 No medical records found matching your patient profile.
                    </div>
                ) : (
                    visibleRecords.map((record) => (
                        <div className="record-card" key={record.id}>
                            <h3>{record.name}</h3>
                            <p>Patient ID : {record.id}</p>
                            <p>Doctor : {record.doctor}</p>
                            <button
                                className="btn-primary"
                                onClick={() => setSelectedRecord(record)}
                            >
                                View Record
                            </button>
                        </div>
                    ))
                )}
            </div>

            {selectedRecord && (
                <div className="modal">
                    <div className="record-popup">
                        <h2>Medical Record</h2>
                        <table className="record-table">
                            <tbody>
                                <tr>
                                    <th>Patient ID</th>
                                    <td>{selectedRecord.id}</td>
                                </tr>
                                <tr>
                                    <th>Name</th>
                                    <td>{selectedRecord.name}</td>
                                </tr>
                                <tr>
                                    <th>Age</th>
                                    <td>{selectedRecord.age}</td>
                                </tr>
                                <tr>
                                    <th>Gender</th>
                                    <td>{selectedRecord.gender}</td>
                                </tr>
                                <tr>
                                    <th>Doctor</th>
                                    <td>{selectedRecord.doctor}</td>
                                </tr>
                                <tr>
                                    <th>Disease</th>
                                    <td>{selectedRecord.disease}</td>
                                </tr>
                                <tr>
                                    <th>Medicine</th>
                                    <td>{selectedRecord.medicine}</td>
                                </tr>
                                <tr>
                                    <th>Date</th>
                                    <td>{selectedRecord.date}</td>
                                </tr>
                            </tbody>
                        </table>
                        <button
                            className="close-btn"
                            onClick={() => setSelectedRecord(null)}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

export default MedicalRecords;