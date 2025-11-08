// client/src/services/api.js
import axios from "axios";

const api = axios.create({
  baseURL: "/api", // Dùng proxy trong package.json
  withCredentials: true, // ← Quan trọng nếu backend dùng cookie
});

// Gửi token tự động
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Xử lý lỗi 401 → tự động logout
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token hết hạn hoặc không hợp lệ
      localStorage.removeItem("token");
      alert("Phiên đăng nhập hết hạn! Vui lòng đăng nhập lại.");
      window.location.href = "/login"; // Chuyển về login
    }
    return Promise.reject(error);
  }
);

export default api;
