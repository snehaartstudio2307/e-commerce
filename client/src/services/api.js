import axios from "axios";

let apiURL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

// Auto-normalize: If the configured URL is missing the "/api" suffix, append it
if (apiURL && !apiURL.endsWith("/api") && !apiURL.endsWith("/api/")) {
  apiURL = apiURL.endsWith("/") ? `${apiURL}api` : `${apiURL}/api`;
}

const api = axios.create({
  baseURL: apiURL,
});

api.interceptors.request.use(
  (config) => {
    const userInfo = localStorage.getItem("userInfo")
      ? JSON.parse(localStorage.getItem("userInfo"))
      : null;
    if (userInfo && userInfo.token) {
      config.headers.Authorization = `Bearer ${userInfo.token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default api;