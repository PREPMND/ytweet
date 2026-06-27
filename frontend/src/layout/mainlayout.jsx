import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
export default function MainLayout(props){
    const {menubar, setMenubar, darkMode, currentId, setcurrentId,  setDarkMode, darkModenav, setDarkModenav,isLoggedIn,setisLoggedIn} = props;
    return(
        <div>
            <h2><Navbar menubar={menubar} currentId={currentId} setcurrentId={setcurrentId} darkMode={darkMode} setMenubar={setMenubar} darkModenav={darkModenav} setDarkModenav={setDarkModenav} setDarkMode={setDarkMode} isLoggedIn={isLoggedIn} setisLoggedIn={setisLoggedIn} /></h2>
            <div><Outlet/></div>
        </div>
    )
}