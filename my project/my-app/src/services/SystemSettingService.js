import api from "./api";

export const getSettings = () =>
    api.get("/systemsettings");

export const saveSettings = (data) =>
    api.post("/systemsettings", data);