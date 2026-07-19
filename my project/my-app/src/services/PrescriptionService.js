import api from "./api";

export const getPrescriptions = () =>
  api.get("/prescriptions");

export const getPatientPrescriptions = (patientName) =>
  api.get(`/prescriptions/patient/${encodeURIComponent(patientName)}`);

export const createPrescription = (data) =>
  api.post("/prescriptions", data);
