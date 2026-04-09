import { Outlet } from "react-router-dom";
export default function MainLayout(){
    return(
        <div>
            <h2>Navbar</h2>
            <div><Outlet/></div>
        </div>
    )
}