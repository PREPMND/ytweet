import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
export default function AppRoutes(){
    return(
        <Routes>
            <Route element={<MainLayout/>}>
            <Route element
            </Route>
        </Routes>
    )
}