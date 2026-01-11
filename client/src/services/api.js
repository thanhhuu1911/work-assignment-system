// client/src/services/api.js
import axios from "axios";
import { showToast } from "../components/Toast";

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Important if using HttpOnly cookies are used
});

// Automatically attach JWT token to every request
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  // Let browser set Content-Type automatically for FormData (multipart/form-data)
  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

// Global error handling – especially for 401 (unauthorized)
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid → force logout
      localStorage.removeItem("token");
      localStorage.removeItem("user"); // nếu bạn lưu user ở đây

      showToast("Your session has expired. Please log in again.", "warning");

      // Redirect to login after toast (small delay for user to read)
      setTimeout(() => {
        window.location.href = "/login";
      }, 1500);
    }

    return Promise.reject(error);
  }
);

export default api;
