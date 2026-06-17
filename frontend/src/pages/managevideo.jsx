import {useNavigate} from "react-router-dom"
export default function ManageVideo(){
    const navigate = useNavigate();
    return(
        <div>
            <h1>Manage Video Page</h1>
            <h3 onClick={() => navigate("/updatevideo/:id")}>Update Video</h3>
        </div>
    )
}