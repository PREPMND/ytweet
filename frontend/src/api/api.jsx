import axios from "axios";

let refreshPromise = null;

const api = axios.create({
  baseURL: `${import.meta.env.VITE_BACKEND}/api/v1`,
  withCredentials: true,
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (
      originalRequest &&
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/users/refreshtoken")
    ) {
      originalRequest._retry = true;

      try {
        await api.post("/users/refreshtoken");
        return api(originalRequest);
      } catch (refreshError) {
        window.dispatchEvent(new Event("logout"));
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;
