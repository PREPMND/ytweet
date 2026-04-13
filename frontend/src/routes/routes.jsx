import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import Login from "../auth/login"
import Register from "../auth/register"
import HomePage from "../pages/home.page.jsx"
import Createvideo from "../pages/getvideo.jsx"
export default function AppRoutes(props){
    const {User} = props;
    return(
        <Routes>
            <Route element={<MainLayout User={User} />}>
            <Route path="/" element={<HomePage User={User} />}/>
            </Route>
            <Route element={<AuthLayout User={User} />}>
            <Route path="/createvideo" element={<Createvideo/>}/>
            <Route path="/login" element={<Login User={User} />} />
            <Route path="/register" element={<Register/>}/>
            </Route>
        </Routes>
    )
}