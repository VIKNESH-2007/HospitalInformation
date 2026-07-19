import api from "./api";

export const getDashboardStats = () => {
    return api.get("/dashboard");
};
