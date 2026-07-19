import api from "./api";

export const getAppointments = () =>
  api.get("/appointments");

export const getAppointment = (id) =>
  api.get(`/appointments/${id}`);

export const bookAppointment = (data) =>
  api.post("/appointments", data);

export const reserveAppointmentSlot = (data) =>
  api.post("/appointments/reserve", data);

export const updateAppointment = (
  id,
  data
) =>
  api.put(`/appointments/${id}`, data);

export const cancelAppointment = (id) =>
  api.delete(`/appointments/${id}`);