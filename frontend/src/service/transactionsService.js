
import api from "./apiClient";

export const transactionsAPI = {

  list: (params = {}) =>
    api.get("/transaction", { params }).then(res => res.data),

 
  create: (data) =>
    api.post("/transaction", data).then(res => res.data),

 
  update: (id, data) =>
    api.put(`/transaction/${id}`, data).then(res => res.data),

  
  remove: (id) =>
    api.delete(`/transaction/${id}`).then(res => res.data),
};
