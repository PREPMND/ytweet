import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
export default function MainLayout(props){
    const {menubar, setMenubar, darkMode, setDarkMode, darkModenav, setDarkModenav} = props;
    return(
        <div>
            <h2><Navbar menubar={menubar} darkMode={darkMode} setMenubar={setMenubar} darkModenav={darkModenav} setDarkModenav={setDarkModenav} setDarkMode={setDarkMode} /></h2>
            <div><Outlet/></div>
        </div>
    )
}