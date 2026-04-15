import axios from "axios";
export default function getCurrentUser() {
    async function fetchData() {
        try {
            const response = await axios.get(
                `${process.env.BACKEND}/api/v1/users/currentuser`,
                { withCredentials: true }
            );
            return response.data;
        } catch (err) {
            if (err.response?.status === 401) {
                console.log("Please log in.");
            } 
            throw err; // Re-throw the error to be handled by the caller
        }
    }
    return fetchData();
}