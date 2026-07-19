import api from "./api";

export const getStaff = () =>
  api.get("/staff");

export const getStaffMember = (id) =>
  api.get(`/staff/${id}`);

export const addStaff = (data) =>
  api.post("/staff", data);

export const updateStaff = (
  id,
  data
) =>
  api.put(`/staff/${id}`, data);

export const deleteStaff = (id) =>
  api.delete(`/staff/${id}`);