
import api from "./apiClient";

export const categoriesAPI = {

  list: () =>
    api.get("/category").then(res => res.data),

  create: (data) =>
    api.post("/category", data).then(res => res.data),

  update: (id, data) =>
    api.put(`/category/${id}`, data).then(res => res.data),


  remove: (id) =>
    api.delete(`/category/${id}`).then(res => res.data),

  getById: (id) => api.get(`/categories/${id}`).then(res => res.data),
};
