import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

// Attach admin token to every request if present
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("admin_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auto-logout on 401 — token expired or invalid
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("admin_token");
      // Dispatch a custom event so AdminPage can react
      window.dispatchEvent(new Event("admin-unauthorized"));
    }
    return Promise.reject(err);
  },
);

export const getCategories = () => api.get("/categories");
export const getProducts = () => api.get("/products");
export const adminLogin = (pin) => api.post("/admin/login", { pin });
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateVariant = (id, data) =>
  api.put(`/products/variant/${id}`, data);
export const deleteVariant = (id) => api.delete(`/products/variant/${id}`);
export const addVariant = (data) => api.post("/products/variant", data);

// Utang endpoints
export const getUtangs = () => api.get("/utangs");
export const getUtang = (id) => api.get(`/utangs/${id}`);
export const addUtang = (data) => api.post("/utangs", data);
export const payUtang = (id, amount) =>
  api.put(`/utangs/${id}/pay`, { amount });
export const updateUtang = (id, data) => api.put(`/utangs/${id}`, data);
export const deleteUtang = (id) => api.delete(`/utangs/${id}`);

// Store settings
export const getSetting = (key) => api.get(`/settings/${key}`);
export const updateSetting = (key, value) =>
  api.put(`/settings/${key}`, { value });

// Attendants
export const getAttendants = () => api.get("/attendants");
export const createAttendant = (data) => api.post("/attendants", data);
export const updateAttendant = (id, data) => api.put(`/attendants/${id}`, data);
export const deleteAttendant = (id) => api.delete(`/attendants/${id}`);

// Sales
export const recordSale = (data) => api.post("/sales", data);
export const getLeaderboard = (period = "all") =>
  api.get(`/sales/leaderboard?period=${period}`);
export const getSalesHistory = (params = {}) =>
  api.get("/sales/history", { params });

export default api;
