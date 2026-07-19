import api from "./api";

export const getPatients = () =>
    api.get("/patients");

export const addPatient = (data) =>
    api.post("/patients", data);

export const updatePatient = (id, data) =>
    api.put(`/patients/${id}`, data);

export const deletePatient = (id) =>
    api.delete(`/patients/${id}`);

// Advanced Identity Search with Confidence Weights
export const searchPatients = (params) => {
    const query = new URLSearchParams(params).toString();
    return api.get(`/patients/search?${query}`);
};

// Biometric & Face Verification Endpoint
export const verifyIdentity = (payload) =>
    api.post("/patients/verify", payload);

// Duplicate Detection List
export const getDuplicates = () =>
    api.get("/patients/duplicates");

// Merge Duplicate Patients Record
export const mergePatients = (payload) =>
    api.post("/patients/merge", payload);

// Scanned Patient Scopes Document Manager API hooks
export const getPatientDocuments = (patientId) =>
    api.get(`/patients/${patientId}/documents`);

export const uploadPatientDocument = (patientId, payload) =>
    api.post(`/patients/${patientId}/documents`, payload);

export const verifyPatientDocument = (docId, payload) =>
    api.post(`/patients/documents/${docId}/verify`, payload);