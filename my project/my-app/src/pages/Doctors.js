import React, { useState, useEffect } from "react";
import { useLanguage } from "../context/LanguageContext";
import "./Doctors.css";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { 
  getDoctors, 
  addDoctor, 
  updateDoctor, 
  deleteDoctor 
} from "../services/DoctorService";

function Doctors() {
  const { t } = useLanguage();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [open, setOpen] = useState(false);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState("add"); // "add" | "edit"
  const [search, setSearch] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    department: "Cardiology",
    experience: "",
    phone: "",
    email: ""
  });

  const userString = localStorage.getItem("user");
  let isAdmin = false;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      isAdmin = user && (user.role || "").toLowerCase() === "admin";
    } catch (e) {
      console.error("Error parsing user role for Doctors:", e);
    }
  }

  useEffect(() => {
    loadDoctorsList();
  }, []);

  const loadDoctorsList = async () => {
    setLoading(true);
    try {
      const response = await getDoctors();
      if (response.data) {
        setDoctors(response.data);
      }
    } catch (e) {
      console.error("Failed to load doctors list from server:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (doctor) => {
    setSelectedDoctor(doctor);
    setOpen(true);
  };

  const handleAddClick = () => {
    if (!isAdmin) return;
    setFormMode("add");
    setFormData({
      name: "",
      department: "Cardiology",
      experience: "",
      phone: "",
      email: ""
    });
    setIsFormOpen(true);
  };

  const handleEdit = (doctor) => {
    if (!isAdmin) return;
    setSelectedDoctor(doctor);
    setFormMode("edit");
    setFormData({
      name: doctor.name || "",
      department: doctor.department || "Cardiology",
      experience: doctor.experience || "",
      phone: doctor.phone || "",
      email: doctor.email || ""
    });
    setIsFormOpen(true);
  };

  const handleDelete = async (doctor) => {
    if (!isAdmin) return;
    const confirmDelete = window.confirm(
      `Are you sure you want to delete ${doctor.name}?`
    );

    if (confirmDelete) {
      try {
        await deleteDoctor(doctor.id);
        setDoctors(doctors.filter((item) => item.id !== doctor.id));
        alert(`${doctor.name} deleted successfully from backend server!`);
      } catch (e) {
        console.error("Failed to delete doctor from server:", e);
        alert("Failed to delete doctor from backend server.");
      }
    }
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!isAdmin) {
      alert("Unauthorized operation.");
      return;
    }

    if (!formData.name || !formData.experience || !formData.phone || !formData.email) {
      alert("Please fill in all fields");
      return;
    }

    try {
      if (formMode === "add") {
        const response = await addDoctor({
          name: formData.name,
          department: formData.department,
          experience: Number(formData.experience),
          phone: formData.phone,
          email: formData.email
        });
        if (response.data) {
          setDoctors([...doctors, response.data]);
          alert("New doctor added successfully on backend server!");
        }
      } else {
        const response = await updateDoctor(selectedDoctor.id, {
          ...selectedDoctor,
          name: formData.name,
          department: formData.department,
          experience: Number(formData.experience),
          phone: formData.phone,
          email: formData.email
        });
        if (response.data) {
          setDoctors(
            doctors.map((d) => d.id === selectedDoctor.id ? response.data : d)
          );
          alert("Doctor details updated successfully on backend server!");
        }
      }
      setIsFormOpen(false);
    } catch (e) {
      console.error("Failed to save doctor details on backend server:", e);
      alert("Failed to save doctor details on backend server.");
    }
  };

  const filteredDoctors = doctors.filter((doctor) =>
    (doctor.name || "").toLowerCase().includes(search.toLowerCase()) ||
    (doctor.department || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="doctors-page">

      <div className="overlay"></div>

      <div className="doctor-content">

        <h1 className="doctor-title">
          👨‍⚕️ {t("doctors")} Management
        </h1>

        <div className="doctor-header">

          {isAdmin && (
            <button className="add-btn" onClick={handleAddClick}>
              + Add Doctor
            </button>
          )}

          <input
            type="text"
            placeholder={t("searchPlaceholder")}
            className="doctor-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />

        </div>

        {loading ? (
          <div className="table-loading">Loading doctors list...</div>
        ) : (
          <table className="doctor-table">

            <thead>
              <tr>
                <th>{t("id")}</th>
                <th>{t("name")}</th>
                <th>Department</th>
                <th>Experience</th>
                <th>{t("actions")}</th>
              </tr>
            </thead>

            <tbody>
              {filteredDoctors.length === 0 ? (
                <tr>
                  <td colSpan="5" className="no-records-cell">No doctors found.</td>
                </tr>
              ) : (
                filteredDoctors.map((doctor) => (
                  <tr key={doctor.id}>
                    <td>{doctor.id}</td>
                    <td>{doctor.name}</td>
                    <td>{doctor.department}</td>
                    <td>{doctor.experience} Years</td>

                    <td>

                      <Button
                        text={t("view")}
                        onClick={() => handleView(doctor)}
                      />

                      {isAdmin && (
                        <Button
                          text={t("edit")}
                          type="success"
                          onClick={() => handleEdit(doctor)}
                        />
                      )}

                      {isAdmin && (
                        <Button
                          text={t("delete")}
                          type="danger"
                          onClick={() => handleDelete(doctor)}
                        />
                      )}

                    </td>
                  </tr>
                ))
              )}
            </tbody>

          </table>
        )}

      </div>

      {/* View Doctor Details Modal */}
      <Modal
        isOpen={open}
        onClose={() => setOpen(false)}
        title="Doctor Details"
      >
        {selectedDoctor && (
          <div className="doctor-details">

            <p>
              <strong>ID :</strong>
              {selectedDoctor.id}
            </p>

            <p>
              <strong>Name :</strong>
              {selectedDoctor.name}
            </p>

            <p>
              <strong>Department :</strong>
              {selectedDoctor.department}
            </p>

            <p>
              <strong>Experience :</strong>
              {selectedDoctor.experience} Years
            </p>

            <p>
              <strong>Phone :</strong>
              {selectedDoctor.phone}
            </p>

            <p>
              <strong>Email :</strong>
              {selectedDoctor.email}
            </p>

          </div>
        )}
      </Modal>

      {/* Add / Edit Doctor Form Modal */}
      {isAdmin && (
        <Modal
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          title={formMode === "add" ? "Add New Doctor" : "Edit Doctor Details"}
        >
          <form onSubmit={handleFormSubmit} className="doctor-form">
            <div className="form-group">
              <label>Doctor Name *</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="E.g. Dr. Robert Chen"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label>Department *</label>
                <select
                  value={formData.department}
                  onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                >
                  <option value="Cardiology">Cardiology</option>
                  <option value="Neurology">Neurology</option>
                  <option value="Orthopedics">Orthopedics</option>
                  <option value="Pediatrics">Pediatrics</option>
                  <option value="General Medicine">General Medicine</option>
                  <option value="Dermatology">Dermatology</option>
                  <option value="Oncology">Oncology</option>
                </select>
              </div>

              <div className="form-group">
                <label>Experience (Years) *</label>
                <input
                  type="number"
                  required
                  min="0"
                  max="60"
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  placeholder="E.g. 10"
                />
              </div>
            </div>

            <div className="form-group">
              <label>Contact Phone *</label>
              <input
                type="text"
                required
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="E.g. +91 9876543210"
              />
            </div>

            <div className="form-group">
              <label>Email Address *</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="E.g. robert@hospital.com"
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="cancel-btn"
                onClick={() => setIsFormOpen(false)}
              >
                Cancel
              </button>
              <button type="submit" className="save-btn">
                {formMode === "add" ? "Add Doctor" : "Save Changes"}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

export default Doctors;