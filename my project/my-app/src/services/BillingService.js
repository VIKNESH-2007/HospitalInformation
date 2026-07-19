import api from "./api";

export const getBills = () =>
  api.get("/billing");

export const getBill = (id) =>
  api.get(`/billing/${id}`);

export const createBill = (data) =>
  api.post("/billing", data);

export const updateBill = (id, data) =>
  api.put(`/billing/${id}`, data);

export const deleteBill = (id) =>
  api.delete(`/billing/${id}`);

export const validateBill = (data) =>
  api.post("/billing/validate", data);

export const approveBill = (id) =>
  api.post(`/billing/${id}/approve`);