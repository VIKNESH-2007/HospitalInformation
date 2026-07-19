import React, { useState, useEffect } from "react";
import { getDashboardStats } from "../services/dashboardService";
import "./Reports.css";

function Reports() {
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalRevenue: 0,
    totalAppointments: 0,
    totalMedicines: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      setLoading(true);
      const response = await getDashboardStats();
      if (response.data) {
        setStats({
          totalPatients: response.data.totalPatients || 0,
          totalRevenue: response.data.totalRevenue || 0,
          totalAppointments: response.data.totalAppointments || 0,
          totalMedicines: response.data.totalMedicines || 0
        });
      }
    } catch (e) {
      console.error("Failed to load reports stats:", e);
    } finally {
      setLoading(false);
    }
  };

  const exportReport = () => {
    alert("Report Exported Successfully");
  };

  const downloadPDF = () => {
    window.print();
  };

  const reports = [
    {
      title: "Total Patients",
      value: stats.totalPatients,
      icon: "👨‍⚕️"
    },
    {
      title: "Total Revenue",
      value: `₹${stats.totalRevenue.toLocaleString("en-IN")}`,
      icon: "💰"
    },
    {
      title: "Appointments",
      value: stats.totalAppointments,
      icon: "📅"
    },
    {
      title: "Medicines Sold",
      value: stats.totalMedicines,
      icon: "💊"
    }
  ];

  return (
    <div className="reports-page">

      <div className="overlay"></div>

      <div className="reports-container">

        <h1 className="reports-title">
          📊 Hospital Reports Dashboard
        </h1>

        <div className="report-actions">
          <button
            className="export-btn"
            onClick={exportReport}
          >
            Export Report
          </button>

          <button
            className="download-btn"
            onClick={downloadPDF}
          >
            Download PDF
          </button>
        </div>

        {loading ? (
          <div className="table-loading">Loading report statistics...</div>
        ) : (
          <div className="cards-container">
            {reports.map((report, index) => (
              <div className="report-card" key={index}>
                <div className="report-icon">
                  {report.icon}
                </div>

                <h2>{report.value}</h2>

                <p>{report.title}</p>
              </div>
            ))}
          </div>
        )}

        <div className="statistics-section">

          <div className="stat-box">
            <h3>Bed Occupancy</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "78%" }}
              >
                78%
              </div>
            </div>
          </div>

          <div className="stat-box">
            <h3>Doctor Availability</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "92%" }}
              >
                92%
              </div>
            </div>
          </div>

          <div className="stat-box">
            <h3>Lab Completion</h3>

            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: "85%" }}
              >
                85%
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}

export default Reports;