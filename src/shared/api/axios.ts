import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const access = localStorage.getItem("access_token");

  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }

  return config;
});