import AppRoutes from './routes/routes.jsx';
import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import getCurrentUser from './api/currentuser.jsx';
const App = () => {
  {/*const [username,setUsername]=useState("")
  async function loginUser(credentials) {
    try {
      const res = await axios.post(
        "http://localhost:8000/api/v1/users/login",
        credentials,
        {
          withCredentials: true, // important if backend CORS has credentials:true
        }
      );
      console.log(res.data.data.user.username)
      return res.data.data.user.username
    } catch (err) {
      console.error("Login failed:", err.response?.data || err.message);
    }
  }
  // Usage:
  useEffect(() => {
    async function fetchUser() {
      const name = await loginUser({ email: "p@p.com", password: "prep" });
      if (name) setUsername(name);
    }
    fetchUser();
  }, []);
*/}
  const [User, setUser] = useState(null);
  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser
  });
  useEffect(() => {
    if (data?.user) {
      setUser(data.user);
    } else {
      setUser(null);
    }
  }, [data]);
  console.log("App component - Current User:", User);
  return (
    <div>
      <AppRoutes User={User} />
    </div>
  )
}

export default App
