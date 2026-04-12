import axios from "axios";
export default function getCurrentUser() {

    async function fetchData() {
        try {
            const response = await axios.get(
                "http://localhost:8000/api/v1/users/currentuser",
                { withCredentials: true }
            );
            console.log(response.data)
            return response.data.data;
        } catch (err) {
            if (err.status == 401) {
                console.log(" Please log in.");
            }
            console.log(err.status);
        }
    }
    fetchData();

}