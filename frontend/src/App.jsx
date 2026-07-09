import AppRoutes from './routes/routes.jsx';
import { useState, useEffect } from 'react';
import { socket } from './socket.jsx';
import { useNavigate } from 'react-router-dom';
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

  const [menubar, setMenubar] = useState(false);
  const [message, setMessage] = useState("");
  const [show, setShow] = useState(false);
  const [darkMode, setDarkMode] = useState(
    JSON.parse(localStorage.getItem("darkMode")) ?? false
  );

  useEffect(() => {
    localStorage.setItem("darkMode", JSON.stringify(darkMode));
    document.body.className = darkMode ? "dark" : "light";
  }, [darkMode]);
  useEffect(() => {
    const handler = (e) => {
      setMessage(e.detail);
      setShow(true);

      setTimeout(() => {
        setShow(false);
      }, 2000);
    };

    window.addEventListener("rate-limit", handler);

    return () =>
      window.removeEventListener("rate-limit", handler);
  }, []);
  const [darkModenav, setDarkModenav] = useState(true);
  const [profileSelected, setProfileSelected] = useState(null);
  const [isLoggedIn, setisLoggedIn] = useState(false);
  const [videoIdSelected, setvideoIdSelected] = useState({});
  const [currentId, setcurrentId] = useState(null);
  return (
    <>
      <div>
        <AppRoutes isLoggedIn={isLoggedIn} currentId={currentId} setcurrentId={setcurrentId} setisLoggedIn={setisLoggedIn} menubar={menubar} profileSelected={profileSelected} setProfileSelected={setProfileSelected} setMenubar={setMenubar} darkMode={darkMode} setDarkMode={setDarkMode} darkModenav={darkModenav} setDarkModenav={setDarkModenav}
          videoIdSelected={videoIdSelected} setvideoIdSelected={setvideoIdSelected} />
      </div>
      {
        show && (
          <div
            className="fixed bottom-6 left-1/2 -translate-x-1/2
               bg-black text-white px-4 py-2 rounded-lg
               shadow-lg z-[9999] animate-fade-in"
          >
            {message}
          </div>
        )
      }
    </>
  )
}

export default App
