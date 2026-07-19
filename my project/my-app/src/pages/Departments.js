import { useState } from "react";
import "./Departments.css";

function Departments() {

    const departments = [
        {
            name: "Cardiology",
            doctor: "Dr. Smith",
            location: "Block A - Floor 2",
            phone: "9876543210",
            description: "Heart disease diagnosis and treatment."
        },
        {
            name: "Neurology",
            doctor: "Dr. David",
            location: "Block B - Floor 1",
            phone: "9876543211",
            description: "Brain and nervous system treatment."
        },
        {
            name: "Orthopedics",
            doctor: "Dr. John",
            location: "Block C - Floor 3",
            phone: "9876543212",
            description: "Bone and joint treatment."
        },
        {
            name: "Pediatrics",
            doctor: "Dr. Priya",
            location: "Block D - Floor 2",
            phone: "9876543213",
            description: "Children's healthcare services."
        },
        {
            name: "Radiology",
            doctor: "Dr. Kumar",
            location: "Block E - Floor 1",
            phone: "9876543214",
            description: "X-Ray, CT Scan and MRI services."
        },
        {
            name: "Emergency",
            doctor: "Dr. Arun",
            location: "Ground Floor",
            phone: "108",
            description: "24/7 Emergency medical services."
        }
    ];

    const [selectedDepartment, setSelectedDepartment] = useState(null);

    return (
        <div className="departments-container">

            <h1 className="departments-title">
                Hospital Departments
            </h1>

            <div className="departments-grid">

                {departments.map((dept, index) => (

                    <div className="department-card" key={index}>

                        <h3>{dept.name}</h3>

                        <p>{dept.description}</p>

                        <button
                            className="department-btn"
                            onClick={() => setSelectedDepartment(dept)}
                        >
                            View Details
                        </button>

                    </div>

                ))}

            </div>

            {/* Popup */}

            {selectedDepartment && (

                <div className="modal">

                    <div className="details-popup">

                        <h2>{selectedDepartment.name}</h2>

                        <table className="details-table">

                            <tbody>

                                <tr>
                                    <th>Doctor</th>
                                    <td>{selectedDepartment.doctor}</td>
                                </tr>

                                <tr>
                                    <th>Location</th>
                                    <td>{selectedDepartment.location}</td>
                                </tr>

                                <tr>
                                    <th>Phone</th>
                                    <td>{selectedDepartment.phone}</td>
                                </tr>

                                <tr>
                                    <th>Description</th>
                                    <td>{selectedDepartment.description}</td>
                                </tr>

                            </tbody>

                        </table>

                        <button
                            className="close-btn"
                            onClick={() => setSelectedDepartment(null)}
                        >
                            Close
                        </button>

                    </div>

                </div>

            )}

        </div>
    );
}

export default Departments;