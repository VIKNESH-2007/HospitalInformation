import api from "./api";

export const getReports = () =>
  api.get("/laboratory");

export const getReport = (id) =>
  api.get(`/laboratory/${id}`);

export const addReport = (data) =>
  api.post("/laboratory", data);

export const updateReport = (
  id,
  data
) =>
  api.put(`/laboratory/${id}`, data);

export const deleteReport = (id) =>
  api.delete(`/laboratory/${id}`);