import axios from "axios";
export default function getCurrentUser() {
    async function fetchData() {
        try {
            const response = await axios.get(
                https://ytweet-61k7.onrender.com,
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