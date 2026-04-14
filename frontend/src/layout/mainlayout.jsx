import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
export default function MainLayout(props){
    const {menubar, setMenubar, darkMode, setDarkMode} = props;
    return(
        <div>
            <h2><Navbar menubar={menubar} setMenubar={setMenubar} darkMode={darkMode} setDarkMode={setDarkMode} /></h2>
            <div><Outlet/></div>
        </div>
    )
}