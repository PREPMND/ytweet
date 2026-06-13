import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
const api = axios.create({
    baseURL: `${import.meta.env.VITE_BACKEND}/api/v1`,
    withCredentials: true,
});


api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        const navigate=useNavigate();
        const queryClient=useQueryClient();
        if (
            error.response?.status === 401 &&
            !originalRequest._retry &&
            !originalRequest.url.includes("/users/refreshtoken")
        ) {
            originalRequest._retry = true;
            try {
                await api.post("/users/refreshtoken");
                return api(originalRequest);
            } catch (refreshError) {
                // clear cache, redirect to login
                queryClient.removeQueries(["currentUser"]);
                navigate("/login");
                return Promise.reject(refreshError);
            }


        }

        return Promise.reject(error);
    }
);

export default api;