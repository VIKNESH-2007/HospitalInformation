import axios from "axios";

// Standard Axios Client pointing to your ASP.NET backend (configured for active port 5000)
const api = axios.create({
  baseURL: "http://localhost:5004/api"
});

// Request Interceptor: Attach JWT Token
api.interceptors.request.use(
  (config) => {
    const userString = localStorage.getItem("user");
    if (userString) {
      try {
        const user = JSON.parse(userString);
        if (user && user.token) {
          config.headers.Authorization = `Bearer ${user.token}`;
        }
      } catch (e) {
        console.error("Error parsing user token for API request:", e);
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;
