import api from "./api";

export default async function getCurrentUser() {
    const response = await api.get("/users/currentuser");
    return response.data;
}