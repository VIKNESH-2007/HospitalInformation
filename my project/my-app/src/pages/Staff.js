import React, { useState, useEffect } from "react";
import "./Staff.css";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { 
  getStaff, 
  addStaff, 
  deleteStaff 
} from "../services/StaffService";

function Staff() {
  const [staff, setStaff] = useState([]);
  const [loading, setLoading] = useState(false);

  const [selectedStaff, setSelectedStaff] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [search, setSearch] = useState("");

  const [newStaff, setNewStaff] = useState({
    name: "",
    role: "",
    shift: ""
  });

  useEffect(() => {
    loadStaffList();
  }, []);

  const loadStaffList = async () => {
    setLoading(true);
    try {
      const response = await getStaff();
      if (response.data) {
        setStaff(response.data);
      }
    } catch (e) {
      console.error("Failed to load staff list from backend database:", e);
    } finally {
      setLoading(false);
    }
  };

  const viewStaff = (member) => {
    setSelectedStaff(member);
    setShowModal(true);
  };

  const handleAddStaff = async () => {
    if (
      !newStaff.name ||
      !newStaff.role ||
      !newStaff.shift
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        name: newStaff.name,
        role: newStaff.role,
        shift: newStaff.shift,
        department: "General Medicine",
        phone: "123-456-7890",
        email: `${newStaff.name.toLowerCase().replace(/\s+/g, "")}@novacare.com`,
        salary: 45000.00
      };

      const response = await addStaff(payload);
      if (response.data) {
        setStaff([...staff, response.data]);
        setNewStaff({
          name: "",
          role: "",
          shift: ""
        });
        alert("Staff Added Successfully");
      }
    } catch (e) {
      console.error("Failed to add staff to database:", e);
      alert("Error adding staff to backend database.");
    }
  };

  const handleDeleteStaff = async (id) => {
    if (window.confirm("Are you sure you want to delete this staff member?")) {
      try {
        await deleteStaff(id);
        setStaff(staff.filter((item) => item.id !== id));
        alert("Staff Deleted Successfully");
      } catch (e) {
        console.error("Failed to delete staff from database:", e);
        alert("Error deleting staff from backend database.");
      }
    }
  };

  const filteredStaff = staff.filter(
    (member) =>
      (member.name || "")
        .toLowerCase()
        .includes(search.toLowerCase()) ||
      (member.role || "")
        .toLowerCase()
        .includes(search.toLowerCase())
  );

  return (
    <div className="staff-page">

      <div className="staff-overlay"></div>

      <div className="staff-content">

        <h1 className="staff-title">
          👨‍⚕️ Hospital Staff Management
        </h1>

        <div className="staff-stats">
          <div className="stat-card">
            <h2>{staff.length}</h2>
            <p>Total Staff</p>
          </div>

          <div className="stat-card">
            <h2>{staff.filter(s => (s.role || "").toLowerCase().includes("nurse")).length}</h2>
            <p>Nurses</p>
          </div>

          <div className="stat-card">
            <h2>{staff.filter(s => (s.role || "").toLowerCase().includes("tech")).length}</h2>
            <p>Technicians</p>
          </div>
        </div>

        <div className="staff-actions">

          <input
            type="text"
            placeholder="Staff Name"
            value={newStaff.name}
            onChange={(e) =>
              setNewStaff({
                ...newStaff,
                name: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Role"
            value={newStaff.role}
            onChange={(e) =>
              setNewStaff({
                ...newStaff,
                role: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Shift"
            value={newStaff.shift}
            onChange={(e) =>
              setNewStaff({
                ...newStaff,
                shift: e.target.value
              })
            }
          />

          <button
            className="add-staff-btn"
            onClick={handleAddStaff}
          >
            + Add Staff
          </button>

          <input
            type="text"
            placeholder="Search Staff..."
            className="search-box"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {loading ? (
          <div className="table-loading">Loading staff list...</div>
        ) : (
          <div className="staff-table-container">

            <table className="staff-table">

              <thead>
                <tr>
                  <th>ID</th>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Shift</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredStaff.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="no-records-cell">No staff records found in database.</td>
                  </tr>
                ) : (
                  filteredStaff.map((member) => (
                    <tr key={member.id}>
                      <td>{member.id}</td>
                      <td>{member.name}</td>
                      <td>{member.role}</td>
                      <td>{member.shift}</td>

                      <td>
                        <Button
                          text="View"
                          onClick={() => viewStaff(member)}
                        />

                        <Button
                          text="Delete"
                          type="danger"
                          onClick={() => handleDeleteStaff(member.id)}
                        />
                      </td>
                    </tr>
                  ))
                )}
              </tbody>

            </table>

          </div>
        )}

      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Staff Details"
      >
        {selectedStaff && (
          <>
            <p>ID : {selectedStaff.id}</p>
            <p>Name : {selectedStaff.name}</p>
            <p>Role : {selectedStaff.role}</p>
            <p>Shift : {selectedStaff.shift}</p>
            <p>Department : {selectedStaff.department}</p>
            <p>Email : {selectedStaff.email}</p>
          </>
        )}
      </Modal>

    </div>
  );
}

export default Staff;