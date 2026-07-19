import api from "./api";

export const getMedicines = () =>
    api.get("/pharmacy");

export const getMedicine = (id) =>
    api.get(`/pharmacy/${id}`);

export const addMedicine = (data) =>
    api.post("/pharmacy", data);

export const updateMedicine = (
    id,
    data
) =>
    api.put(`/pharmacy/${id}`, data);

export const deleteMedicine = (id) =>
    api.delete(`/pharmacy/${id}`);