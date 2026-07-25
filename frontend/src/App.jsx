import AppRoutes from './routes/routes.jsx';
import { useState, useEffect } from 'react';
import { socket } from './socket.jsx';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "./api/currentuser";
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
  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
    staleTime: 1000 * 60 * 10,
  });
  const [menubar, setMenubar] = useState(false);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [profileSelected, setProfileSelected] = useState(null);
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) ?? false
  );

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);
  useEffect(() => {

    if (!data?.user?._id) return;

    if (!socket.connected) {
      socket.connect();
    }

    const register = () => {
      console.log("EMIT REGISTER", data.user._id);
      socket.emit("register-user", data.user._id);
    };

    if (socket.connected) {
      register();
    }

    socket.on("connect", register);

    return () => {
      socket.off("connect", register);
    };

  }, [data]);
  const [darkModenav, setDarkModenav] = useState(true);

  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [videoIdSelected, setvideoIdSelected] = useState({});
  const [currentId, setcurrentId] = useState(null);
  return (
    <>
      <div>
        <AppRoutes isLoggedIn={isLoggedIn} currentId={currentId} setcurrentId={setcurrentId} setisLoggedIn={setisLoggedIn} menubar={menubar} profileSelected={profileSelected} setProfileSelected={setProfileSelected} setMenubar={setMenubar} darkMode={darkMode} setDarkMode={setDarkMode} darkModenav={darkModenav} setDarkModenav={setDarkModenav}
          videoIdSelected={videoIdSelected} setvideoIdSelected={setvideoIdSelected} />
      </div>

    </>
  )
}

export default App
