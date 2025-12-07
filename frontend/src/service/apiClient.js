import axios from "axios";

const API_BASE =  "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE,
  withCredentials: true, 
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});


api.interceptors.request.use(
  (config) => {
   
    return config;
  },
  (error) => Promise.reject(error)
);


api.interceptors.response.use(
  (res) => res,
  (error) => {

    if (error.response?.status === 401) {
      console.warn("User not authenticated");
    }
    return Promise.reject(error);
  }
);

export default api;
