import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import Login from "../src/auth/login"
import Register from "../src/auth/register"
export default function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayout/>}>
            <Route path="/" element={<h1>home</h1>}/>
            </Route>
            <Route element={<AuthLayout/>}>
            <Route path="/login" element={<Login/>} />
            <Route path="/register" element={<Register/>}/>
            </Route>
        </Routes>
    )
}