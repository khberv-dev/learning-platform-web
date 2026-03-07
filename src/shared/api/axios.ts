import axios from "axios";
import { useAuth } from "../../state/auth";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error?.response?.status === 401) {
      const logout = useAuth.getState().logout;
      logout();
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);