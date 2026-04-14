import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
export default function MainLayout(props){
    const {menubar, setMenubar} = props;
    return(
        <div>
            <h2><Navbar menubar={menubar} setMenubar={setMenubar} /></h2>
            <div><Outlet/></div>
        </div>
    )
}