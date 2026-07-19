import api from "./api";

export const getDoctors = () =>
  api.get("/doctors");

export const getDoctor = (id) =>
  api.get(`/doctors/${id}`);

export const addDoctor = (doctor) =>
  api.post("/doctors", doctor);

export const updateDoctor = (
  id,
  doctor
) =>
  api.put(`/doctors/${id}`, doctor);

export const deleteDoctor = (id) =>
  api.delete(`/doctors/${id}`);