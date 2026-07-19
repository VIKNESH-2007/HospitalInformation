import api from "./api";

export const getRosters = () =>
  api.get("/resources/roster");

export const getInventory = () =>
  api.get("/resources/inventory");

export const updateInventoryStock = (id, newStock) =>
  api.put(`/resources/inventory/${id}`, newStock, {
    headers: { "Content-Type": "application/json" }
  });

export const getMaintenance = () =>
  api.get("/resources/maintenance");

export const replaceRosterStaff = (id, newStaffName) =>
  api.put(`/resources/roster/${id}/replace`, JSON.stringify(newStaffName), {
    headers: { "Content-Type": "application/json" }
  });
