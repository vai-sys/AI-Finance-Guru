


import api from "./apiClient";


const authService = {
  register: async (userData) => {
    const res = await api.post("/user/register", userData);
    return res.data;
  },

  login: async (credentials) => {
    const res = await api.post("/user/login", credentials);
    return res.data;
  },

  getProfile: async () => {
    const res = await api.get("/user/profile");
    return res.data;
  },

  updateProfile: async (updates) => {
    const res = await api.patch("/user/profile", updates);
    return res.data;
  },

  logout: async () => {
    const res = await api.post("/user/logout");
    return res.data;
  },
};

export default authService;
