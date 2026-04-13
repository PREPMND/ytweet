import axios from "axios";
export default function getCurrentUser() {
    async function fetchData() {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/v1/users/currentuser",
                { withCredentials: true }
            );
            
            return response.data;
        } catch (err) {
            if (err.response?.status === 401) {
                console.log("Please log in.");
            } else {
                console.log("Error status:", err.response?.status);
                console.log("Error data:", err.response?.data);
            }
            throw err.response; // Re-throw the error to be handled by the caller
        }
    }
    return fetchData();
}