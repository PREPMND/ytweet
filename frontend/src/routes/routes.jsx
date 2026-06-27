import {Routes,Route} from "react-router-dom"
import MainLayout from "../layout/mainlayout"
import AuthLayout from "../layout/authlayout"
import Login from "../auth/login"
import Register from "../auth/register"
import HomePage from "../pages/home.page.jsx"
import Createvideo from "../pages/createvideo.jsx"
import VideoList from "../pages/getvideo.jsx"
import ChannelIndv from "../pages/channelindv.jsx"
import { VideoIndv } from "../pages/videoplayer.jsx"
import ManageVideo from "../pages/managevideo.jsx"
import UpdateVideo from "../pages/updatevideo.jsx"
import AccountPage from "../pages/accountpage.jsx"
import UpdateProfile from "../pages/updateuserdetails.jsx"
import ChangeAvatar from "../pages/updateavatar.jsx"
import ChangePassword from "../pages/changepassword.jsx"
export default function AppRoutes(props){
    const {menubar,setMenubar,darkModenav,setDarkModenav,darkMode,setDarkMode,profileSelected,setProfileSelected, setisLoggedIn,isLoggedIn,videoIdSelected,setvideoIdSelected } = props;
    return(
        <Routes>
            <Route element={<MainLayout menubar={menubar} profileSelected={profileSelected} setProfileSelected={setProfileSelected} darkMode={darkMode} setDarkMode={setDarkMode} setMenubar={setMenubar} darkModenav={darkModenav} setDarkModenav={setDarkModenav} isLoggedIn={isLoggedIn} setisLoggedIn={setisLoggedIn} />}>
            <Route path="/" element={
                <>
                <VideoList setDarkMode={setDarkMode}  profileSelected={profileSelected} setProfileSelected={setProfileSelected} darkMode={darkMode} setvideoIdSelected={setvideoIdSelected} videoIdSelected={videoIdSelected} />
                </>}/>
            </Route>
            <Route element={<AuthLayout />}>
            <Route path="/message" element={<Messages darkMode={darkMode}/>}/>
            <Route path="/:username" element={<ChannelIndv profileSelected={profileSelected} setProfileSelected={setProfileSelected} darkMode={darkMode} setDarkMode={setDarkMode} setvideoIdSelected={setvideoIdSelected} videoIdSelected={videoIdSelected} />}/>
            <Route path="/watchvideo/:id" element={<VideoIndv videoIdSelected={videoIdSelected} setvideoIdSelected={setvideoIdSelected} darkMode={darkMode} />} />
            <Route path="/currentuserdetails" element={<AccountPage darkMode={darkMode}/>} />
            <Route path="/updateuserdetails" element={<UpdateProfile darkMode={darkMode} />} />
            <Route path="/updateuserdetails/changeavatar" element={<ChangeAvatar darkMode={darkMode} />} />
            <Route path="/changepassword" element={<ChangePassword darkMode={darkMode} />} />
            <Route path="/managevideo" element={<ManageVideo darkMode={darkMode}/>} />
            <Route path="/updatevideo/:id" element={<UpdateVideo darkMode={darkMode} />}/>
            <Route path="/createvideo" element={<Createvideo darkMode={darkMode}/>} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register setisLoggedIn={setisLoggedIn}  />}/>
            </Route>
        </Routes>
    )
}