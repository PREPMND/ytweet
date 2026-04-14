import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import Login from "../auth/login"
import Register from "../auth/register"
import HomePage from "../pages/home.page.jsx"
import Createvideo from "../pages/createvideo.jsx"
import VideoList from "../pages/getvideo.jsx"
export default function AppRoutes(props){
    const {menubar,setMenubar} = props;
    return(
        <Routes>
            <Route element={<MainLayout menubar={menubar} setMenubar={setMenubar} />}>
            <Route path="/" element={
                <>
                <HomePage />
                <VideoList />
                </>}/>
            </Route>
            <Route element={<AuthLayout />}>
            <Route path="/createvideo" element={<Createvideo/>}/>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register/>}/>
            </Route>
        </Routes>
    )
}