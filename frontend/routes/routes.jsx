import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import Login from "../src/auth/login"
import Register from "../src/auth/register"
export default function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayout/>}>
            </Route>
            <Route element={<AuthLayout/>}>
            <Route element={<Login/>} path="/login"/>
            <Route element={<Register/>} path="/register"/>
            </Route>
        </Routes>
    )
}