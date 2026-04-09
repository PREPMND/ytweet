import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
export default function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayout/>}>
            </Route>
            <Route element={<AuthLayout/>}>
            
            </Route>
        </Routes>
    )
}