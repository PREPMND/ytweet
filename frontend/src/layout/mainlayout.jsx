import { Outlet } from "react-router-dom";
import Navbar from "../components/navbar";
export default function MainLayout(props){
    const {User} = props;
    return(
        <div>
            <h2><Navbar User={User} /></h2>
            <div><Outlet/></div>
        </div>
    )
}