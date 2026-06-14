import api from "./api";

export default async function getCurrentUser() {
    const response = await api.get("/users/currentuser");
    console.log("Current User Data:", response.data);
    return response.data;
}