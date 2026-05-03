import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3001",
});

// 🔥 REQUEST INTERCEPTOR
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// 🔥 RESPONSE INTERCEPTOR
api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      console.log("Token expirado o inválido");

      localStorage.removeItem("token");

      // 🔥 redirigir al login
      window.location.href = "/login";
    }

    return Promise.reject(error);
  }
);

export default api;