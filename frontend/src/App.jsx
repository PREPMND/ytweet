import AppRoutes from './routes/routes.jsx';
import { useState, useEffect } from 'react';
import { socket } from './socket.jsx';
import { useNavigate } from 'react-router-dom';
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "./api/currentuser";
// Only the default chat wallpaper is needed here; the full set lives in
// utils/themeObject.jsx. The other 13 imports were unused but still pulled
// every one of those JPEGs into the bundle graph.
import { themeObject } from "./utils/themeObject.jsx";
import ToastHost from "./components/toast.jsx";

const DEFAULT_THEME = themeObject.PCSmall[1];

/**
 * The persisted value is an asset URL, and asset URLs change between a dev
 * server and a production build (Vite fingerprints them). A stale URL left
 * the chat wallpaper pointing at a 404, so validate it against the themes
 * that actually exist right now and fall back when it no longer resolves.
 */
function readStoredTheme() {
    try {
        const stored = localStorage.getItem("themeSelected");
        const known = Object.values(themeObject).flatMap((group) => Object.values(group));
        return known.includes(stored) ? stored : DEFAULT_THEME;
    } catch {
        // Private mode / blocked storage: just use the default.
        return DEFAULT_THEME;
    }
}

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
  const [themeSelected, setthemeSelected] = useState(readStoredTheme);
  const [darkMode, setDarkMode] = useState(() => {
    try {
      // `JSON.parse(null)` is null (fine), but `JSON.parse("undefined")`
      // THROWS -- and a throw in a useState initialiser blanks the whole app.
      return JSON.parse(localStorage.getItem("darkMode")) ?? false;
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem("themeSelected", themeSelected);
    } catch { /* storage unavailable */ }
  }, [themeSelected]);

  useEffect(() => {
    try {
      localStorage.setItem("darkMode", JSON.stringify(darkMode));
    } catch { /* storage unavailable */ }
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
      {/* One host for the whole app; anything can raise a toast with
          `toast("...")` from components/toast.jsx, including non-React code
          such as the axios interceptor. */}
      <ToastHost />
      <div>
        <AppRoutes themeSelected={themeSelected} setthemeSelected={setthemeSelected} isLoggedIn={isLoggedIn} currentId={currentId} setcurrentId={setcurrentId} setisLoggedIn={setisLoggedIn} menubar={menubar} profileSelected={profileSelected} setProfileSelected={setProfileSelected} setMenubar={setMenubar} darkMode={darkMode} setDarkMode={setDarkMode} darkModenav={darkModenav} setDarkModenav={setDarkModenav}
          videoIdSelected={videoIdSelected} setvideoIdSelected={setvideoIdSelected} />
      </div>

    </>
  )
}

export default App
