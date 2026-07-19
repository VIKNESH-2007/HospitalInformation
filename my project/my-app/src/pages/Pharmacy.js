import React, { useState, useEffect } from "react";
import "./Pharmacy.css";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { 
  getMedicines, 
  addMedicine, 
  deleteMedicine 
} from "../services/PharmacyServices";

function Pharmacy() {
  const [medicines, setMedicines] = useState([]);
  const [loading, setLoading] = useState(false);

  const userString = localStorage.getItem("user");
  let isAdmin = false;
  if (userString) {
    try {
      const user = JSON.parse(userString);
      isAdmin = user && (user.role || "").toLowerCase() === "admin";
    } catch (e) {
      console.error("Error parsing user role for Pharmacy:", e);
    }
  }

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const [newMedicine, setNewMedicine] = useState({
    name: "",
    quantity: "",
    expiry: "",
    price: ""
  });

  useEffect(() => {
    loadMedicinesList();
  }, []);

  const loadMedicinesList = async () => {
    setLoading(true);
    try {
      const response = await getMedicines();
      if (response.data) {
        setMedicines(response.data);
      }
    } catch (e) {
      console.error("Failed to load medicines from backend database:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (medicine) => {
    setSelectedMedicine(medicine);
    setShowModal(true);
  };

  const handleAddMedicine = async () => {
    if (
      !newMedicine.name ||
      !newMedicine.quantity ||
      !newMedicine.expiry ||
      !newMedicine.price
    ) {
      alert("Fill all fields");
      return;
    }

    try {
      const payload = {
        medicineName: newMedicine.name,
        category: "General",
        quantity: parseInt(newMedicine.quantity),
        price: parseFloat(newMedicine.price),
        expiryDate: newMedicine.expiry,
        manufacturer: "Generic Pharma"
      };

      const response = await addMedicine(payload);
      if (response.data) {
        setMedicines([...medicines, response.data]);
        setNewMedicine({
          name: "",
          quantity: "",
          expiry: "",
          price: ""
        });
        alert("Medicine Added Successfully");
      }
    } catch (e) {
      console.error("Failed to add medicine on backend database:", e);
      alert("Error adding medicine to backend database.");
    }
  };

  const handleDeleteMedicine = async (id) => {
    if (window.confirm("Are you sure you want to delete this medicine?")) {
      try {
        await deleteMedicine(id);
        setMedicines(medicines.filter((medicine) => medicine.id !== id));
        alert("Medicine Deleted Successfully");
      } catch (e) {
        console.error("Failed to delete medicine from database:", e);
        alert("Error deleting medicine from backend database.");
      }
    }
  };

  const printMedicine = (medicine) => {
    const expiryStr = medicine.expiryDate ? medicine.expiryDate.split("T")[0] : "";
    const bill = `
Medicine ID : ${medicine.id}
Medicine Name : ${medicine.medicineName}
Quantity : ${medicine.quantity}
Expiry Date : ${expiryStr}
Price : ₹${medicine.price}
`;

    const printWindow = window.open("", "", "width=500,height=500");
    printWindow.document.write(`<pre>${bill}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="pharmacy-page">

      <div className="overlay"></div>

      <div className="pharmacy-content">

        <h1 className="page-title">
          💊 Pharmacy Management
        </h1>

        {isAdmin && (
          <div className="add-form">

            <input
              type="text"
              placeholder="Medicine Name"
              value={newMedicine.name}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  name: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Quantity"
              value={newMedicine.quantity}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  quantity: e.target.value
                })
              }
            />

            <input
              type="date"
              value={newMedicine.expiry}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  expiry: e.target.value
                })
              }
            />

            <input
              type="number"
              placeholder="Price"
              value={newMedicine.price}
              onChange={(e) =>
                setNewMedicine({
                  ...newMedicine,
                  price: e.target.value
                })
              }
            />

            <button
              className="add-btn"
              onClick={handleAddMedicine}
            >
              + Add Medicine
            </button>

          </div>
        )}

        {loading ? (
          <div className="table-loading">Loading pharmacy inventory...</div>
        ) : (
          <table className="pharmacy-table">

            <thead>
              <tr>
                <th>ID</th>
                <th>Medicine</th>
                <th>Quantity</th>
                <th>Expiry Date</th>
                <th>Price</th>
                <th>Actions</th>
              </tr>
            </thead>

            <tbody>
              {medicines.length === 0 ? (
                <tr>
                  <td colSpan="6" className="no-records-cell">No medicines found in database.</td>
                </tr>
              ) : (
                medicines.map((medicine) => (
                  <tr key={medicine.id}>
                    <td>{medicine.id}</td>
                    <td>{medicine.medicineName}</td>
                    <td>{medicine.quantity}</td>
                    <td>{medicine.expiryDate ? medicine.expiryDate.split("T")[0] : ""}</td>
                    <td>₹{medicine.price}</td>

                    <td>
                      <Button
                        text="View"
                        onClick={() => handleView(medicine)}
                      />

                      <Button
                        text="Print"
                        type="success"
                        onClick={() => printMedicine(medicine)}
                      />

                      {isAdmin && (
                        <Button
                          text="Delete"
                          type="danger"
                          onClick={() => handleDeleteMedicine(medicine.id)}
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

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Medicine Details"
      >
        {selectedMedicine && (
          <>
            <p>ID : {selectedMedicine.id}</p>
            <p>Name : {selectedMedicine.medicineName}</p>
            <p>Quantity : {selectedMedicine.quantity}</p>
            <p>Expiry : {selectedMedicine.expiryDate ? selectedMedicine.expiryDate.split("T")[0] : ""}</p>
            <p>Price : ₹{selectedMedicine.price}</p>
          </>
        )}
      </Modal>

    </div>
  );
}

export default Pharmacy;