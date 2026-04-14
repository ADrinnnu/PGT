import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5074/api",
});

api.interceptors.request.use(
  (config) => {
    let token =
      localStorage.getItem("tms_token") || localStorage.getItem("token");
    if (token) {
      token = token.replace(/^"|"$/g, "");
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem("tms_token");
      localStorage.removeItem("tms_user");
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

export default api;
