import { Outlet } from "react-router-dom";
import Navbar from "../../components/navbar";
export default function MainLayout(){
    return(
        <div>
            <h2><Navbar/></h2>
            <div><Outlet/></div>
        </div>
    )
}