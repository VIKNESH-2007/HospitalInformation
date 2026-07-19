import React, { useState, useEffect } from "react";
import "./Laboratory.css";
import Button from "../components/Button";
import Modal from "../components/Modal";
import { 
  getReports, 
  addReport, 
  deleteReport 
} from "../services/LaboratoryServices";

function Laboratory() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedReport, setSelectedReport] = useState(null);

  const [newReport, setNewReport] = useState({
    patient: "",
    test: "",
    result: "",
    status: ""
  });

  useEffect(() => {
    loadReportsList();
  }, []);

  const loadReportsList = async () => {
    setLoading(true);
    try {
      const response = await getReports();
      if (response.data) {
        setReports(response.data);
      }
    } catch (e) {
      console.error("Failed to load laboratory reports from backend:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleView = (report) => {
    setSelectedReport(report);
    setShowModal(true);
  };

  const handleAddReport = async () => {
    if (
      !newReport.patient ||
      !newReport.test ||
      !newReport.result ||
      !newReport.status
    ) {
      alert("Please fill all fields");
      return;
    }

    try {
      const payload = {
        patientName: newReport.patient,
        testName: newReport.test,
        testResult: newReport.result,
        status: newReport.status,
        doctorName: "General Practice",
        testDate: new Date().toISOString()
      };

      const response = await addReport(payload);
      if (response.data) {
        setReports([...reports, response.data]);
        setNewReport({
          patient: "",
          test: "",
          result: "",
          status: ""
        });
        alert("Lab Report Added Successfully");
      }
    } catch (e) {
      console.error("Failed to add laboratory report to database:", e);
      alert("Error adding laboratory report to backend database.");
    }
  };

  const handleDeleteReport = async (id) => {
    if (window.confirm("Are you sure you want to delete this lab report?")) {
      try {
        await deleteReport(id);
        setReports(reports.filter((r) => r.id !== id));
        alert("Report Deleted Successfully");
      } catch (e) {
        console.error("Failed to delete lab report from database:", e);
        alert("Error deleting lab report from backend database.");
      }
    }
  };

  const printReport = (report) => {
    const content = `
Laboratory Report

Patient : ${report.patientName}
Test : ${report.testName}
Result : ${report.testResult}
Status : ${report.status}
`;

    const printWindow = window.open("", "", "width=600,height=600");
    printWindow.document.write(`<pre style="font-size:18px">${content}</pre>`);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="lab-page">

      <div className="lab-content">

        <h1 className="lab-title">
          🧪 Laboratory Management
        </h1>

        <div className="lab-form">

          <input
            type="text"
            placeholder="Patient Name"
            value={newReport.patient}
            onChange={(e) =>
              setNewReport({
                ...newReport,
                patient: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Test Name"
            value={newReport.test}
            onChange={(e) =>
              setNewReport({
                ...newReport,
                test: e.target.value
              })
            }
          />

          <input
            type="text"
            placeholder="Result"
            value={newReport.result}
            onChange={(e) =>
              setNewReport({
                ...newReport,
                result: e.target.value
              })
            }
          />

          <select
            value={newReport.status}
            onChange={(e) =>
              setNewReport({
                ...newReport,
                status: e.target.value
              })
            }
          >
            <option value="">Status</option>
            <option>Completed</option>
            <option>Processing</option>
            <option>Pending</option>
          </select>

          <button
            className="add-report-btn"
            onClick={handleAddReport}
          >
            + Add Report
          </button>

        </div>

        {loading ? (
          <div className="table-loading">Loading laboratory reports...</div>
        ) : (
          <div className="report-card-container">
            {reports.length === 0 ? (
              <div className="no-records-card">No laboratory reports recorded.</div>
            ) : (
              reports.map((report) => (
                <div
                  className="report-card"
                  key={report.id}
                >
                  <h2>{report.patientName}</h2>

                  <p>
                    <strong>Test:</strong> {report.testName}
                  </p>

                  <p>
                    <strong>Result:</strong> {report.testResult}
                  </p>

                  <p>
                    <strong>Status:</strong> {report.status}
                  </p>

                  <div className="card-buttons">
                    <Button
                      text="View"
                      onClick={() => handleView(report)}
                    />

                    <Button
                      text="Print"
                      type="success"
                      onClick={() => printReport(report)}
                    />

                    <Button
                      text="Delete"
                      type="danger"
                      onClick={() => handleDeleteReport(report.id)}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        )}

      </div>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Laboratory Report"
      >
        {selectedReport && (
          <>
            <p>Patient : {selectedReport.patientName}</p>
            <p>Test : {selectedReport.testName}</p>
            <p>Result : {selectedReport.testResult}</p>
            <p>Status : {selectedReport.status}</p>
          </>
        )}
      </Modal>

    </div>
  );
}

export default Laboratory;