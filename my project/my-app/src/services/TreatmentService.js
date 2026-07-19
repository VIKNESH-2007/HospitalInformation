import api from "./api";

export const getTreatments = () =>
  api.get("/treatments");

export const createTreatment = (data) =>
  api.post("/treatments", data);

export const startTreatment = (id) =>
  api.post(`/treatments/${id}/start`);

export const completeTreatment = (id) =>
  api.post(`/treatments/${id}/complete`);

export const updateTreatment = (id, data) =>
  api.put(`/treatments/${id}`, data);
