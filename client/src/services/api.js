import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api",
});

export const getCategories = () => api.get("/categories");
export const getProducts = () => api.get("/products");
export const adminLogin = (pin) => api.post("/admin/login", { pin });
export const updateProduct = (id, data) => api.put(`/products/${id}`, data);
export const deleteProduct = (id) => api.delete(`/products/${id}`);
export const updateVariant = (id, data) =>
  api.put(`/products/variant/${id}`, data);
export const deleteVariant = (id) => api.delete(`/products/variant/${id}`);
export const addVariant = (data) => api.post("/products/variant", data);
export const getProductByBarcode = (code) =>
  api.get(`/products/barcode/${code}`);
export default api;
