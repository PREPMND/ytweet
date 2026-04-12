import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import Login from "../auth/login"
import Register from "../auth/register"
import { Home } from "lucide-react"
export default function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayout/>}>
            <Route path="/" element={<Home/>}/>
            </Route>
            <Route element={<AuthLayout/>}>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>}/>
            </Route>
        </Routes>
    )
}