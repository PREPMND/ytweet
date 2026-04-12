import axios from "axios";

export default function getCurrentUser() {
  async function fetchData() {
    try {
      const response = await axios.get(
        "http://localhost:8000/api/v1/users/currentuser",
        { withCredentials: true }
      );
      console.log("Response data:", response.data);
      console.log("Response object:", response);
console.log("Response data:", response.data);
console.log("Status code:", response.data.statusCode);
console.log("User data:", response.data.data);
      return response.data;
    } catch (err) {
      if (err.response?.status === 401) {
        console.log("Please log in.");
      } else {
        console.log("Error status:", err.response?.status);
        console.log("Error data:", err.response?.data);
      }
    }
  }
  fetchData();
}