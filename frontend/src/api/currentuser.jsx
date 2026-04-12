export default function getCurrentUser() {
    useEffect(() => {
        async function fetchData() {
            try {
                const response = await axios.get(
                    "http://localhost:8000/api/v1/users/currentuser",
                    { withCredentials: true } // <-- critical
                );
                console.log(response.data)
                setUser(response.data.data);
                setMessage(response.data.message);
            } catch (err) {
                if (err.status == 401) {
                    console.log(" Please log in.");
                }
                console.log(err.status);
            }
        }
        fetchData();
    }, []);
}