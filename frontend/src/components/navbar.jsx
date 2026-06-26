import { useQuery, useQueryClient } from "@tanstack/react-query";
import getCurrentUser from '../api/currentuser.jsx';
import logolight from "../assets/logolight.jpg"
import logodark from "../assets/logodark..jpg"
import { Album, Airplay, Bolt, CirclePlus, VideotapeIcon, PlayCircle, PlusCircle, ToggleRight, LucideToggleLeft, ChevronDown, MessageCircleCode, SquareDashedText, ScanSearch, MessageCircleDashedIcon } from "lucide-react"
import { useState, useEffect, useEffectEvent } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import api from "../api/api.jsx";

const Navbar = ({ menubar, setMenubar, darkModenav, setDarkModenav, darkMode, setDarkMode, isLoggedIn, setisLoggedIn }) => {
    const [navigate, setNavigate] = useState(false);
    const [hoverBolt, setHoverBolt] = useState(false)
    const [hoverAlbum, setHoverAlbum] = useState(false);
    const [hoverAirplay, setHoverAirplay] = useState(false)
    const queryClient = useQueryClient();
    const navigating = useNavigate();
    const location = useLocation();
    console.log(isLoggedIn)
    const { data, error } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: 1000* 60* 10,
        refetchOnWindowFocus: true,
    
    });
    useEffect(() => {
        // Whenever the route changes to "/", reset menu state
        if (location.pathname === "/") {
            setMenubar(false);
        }
    }, [location])
    useEffect(() => {
        if (error?.response?.status === 401 && !navigate) {
            setNavigate(true);
        }
        if (error) { setisLoggedIn(false) }
        if (!error) { setisLoggedIn(true) }
        console.log(error);
    }, [error]);
    useEffect(() => {

        const interval = setInterval(() => {

            if (!data?.user) {
                setNavigate(true);
            }

        }, 300000);

        return () => clearInterval(interval);

    }, [data]);
    const HandleLogout = async () => {
        const confirmLogout = await api.post(`${import.meta.env.VITE_BACKEND}/api/v1/users/logout`, {}, { withCredentials: true });
        if (confirmLogout.status === 200) {
            queryClient.removeQueries(["currentUser"]);
            setisLoggedIn(false);
            setNavigate(true);
            window.location.reload();
        }
    }
    return (
        <>
            <div className={darkMode ? "bg-black  text-white" : ""}>
                <div className="flex items-center inset-0 z-0 h-[80px] justify-between select-none border-gray-700">

                    <div className="flex items-center h-[80px] gap-4 pl-5">
                        <img
                            onClick={() => setMenubar(true)}
                            className="rounded-full object-cover w-10 h-10 
                            hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer
                            hover:ring-2 hover:ring-blue-500"
                            src={data?.user?.avatar || "https://i.sstatic.net/lsh78.jpg"}
                            alt="User Avatar"
                        />
                        <span className={`hidden sm:block text-[18px] font-medium ${darkMode ? "text-gray-200" : "text-gray-700"}`}>
                            {data?.user?.fullName}
                        </span>
                    </div>

                    <div className="w-fit sm:flex absolute hidden left-1/2 top-3">
                        <img className="w-12 h-12 object-cover" src={darkMode ? logodark : logolight} />
                    </div>
                    
                    <div className="flex items-center mt-4 gap-11 z-20 pr-4 sm:pr-9">

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAirplay(true)}
                            onMouseLeave={() => setHoverAirplay(false)}
                        >
                            <Airplay className={`${hoverAirplay ? "text-yellow-400" : "text-gray-400"}`} />
                            <span className={`text-[12px]  mt-1 font-[600] transition-opacity duration-300 ${hoverAirplay ? "opacity-100" : "opacity-0"} ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                JoinEdge
                            </span>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAlbum(true)}
                            onMouseLeave={() => setHoverAlbum(false)}
                        >
                            <Album className={`${darkMode ? "text-gray-300" : ""}`} />
                            <span className={`text-[12px] mt-1 font-[600] transition-opacity duration-300 ${hoverAlbum ? "opacity-100" : "opacity-0"} ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                Saved
                            </span>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverBolt(true)}
                            onMouseLeave={() => setHoverBolt(false)}
                        >
                            <Bolt className={`${hoverBolt ? "text-blue-400" : "text-gray-400"}`} />
                            <span className={`text-[11px] mt-1 font-[600] transition-opacity duration-300 ${hoverBolt ? "opacity-100" : "opacity-0"} ${darkMode ? "text-gray-300" : "text-gray-600"}`}>
                                PREP
                            </span>
                        </div>
                    </div>
                </div>

                <div className={`w-full border-t ${darkMode ? "border-gray-800" : ""}`}></div>
                
            </div>



            <div className="md:hidden h-[7%] z-50 bg-neutral-900 fixed bottom-0 w-full flex items-center justify-evenly">
                    <SquareDashedText className={ `hover:scale-[1.05] transition-transform duration-300 ease-in-out text-yellow-50 `}
                    />



                    <ScanSearch className={`hover:scale-[1.05] transition-transform duration-300 ease-in-out text-white `}/>
            </div>





            {navigate && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-60"></div>

                    <div className={`relative w-[80%] h-[35%] md:w-[50%] md:h-[40%] rounded-lg shadow-lg flex flex-col items-center justify-center gap-6 z-50 ${darkMode ? "bg-gray-900 text-white" : "bg-white"}`}>
                        <h2 className="text-xl font-bold">Please log in to continue</h2>
                        <button
                            onClick={() => navigating("/login")}
                            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
                        >
                            Move to Login
                        </button>
                        <CirclePlus
                            onClick={() => setNavigate(false)}
                            className="absolute top-3 right-3 cursor-pointer text-gray-400 hover:text-white rotate-45"
                        />
                    </div>
                </div>
            )}

            {menubar && (
                <div className="fixed inset-0 z-50  flex">
                    <div
                        className="absolute inset-0 bg-black opacity-60"
                        onClick={() => setMenubar(false)}
                    ></div>

                    <div

                        className={`relative sm:w-[45%] w-[60%] md:w-[40%] lg:w-[30%] h-full shadow-lg flex flex-col pl-[30px] md:pl-[44px] pt-5 gap-6 z-50 ${darkMode ? "bg-neutral-900 shadow-lg shadow-neutral-200 no-scrollbar  text-white" : "bg-white"} select-none overflow-x-hidden overflow-y-scroll`}>
                        <div>

                            <div className="flex items-center mt-4 flex-col justify-center mr-[40px] mb-4">
                                <div>
                                    <img
                                        className={`${darkMode ? "shadow-white" : ""} hover:ring-2 ring-fuchsia-400 shadow-md shadow-stone-500 rounded-full h-[100px] w-[100px] md:h-[140px] md:w-[140px] object-cover mb-2 transition-transform duration-300 ease-in-out hover:bg-white/20 hover:scale-[1.04]`}
                                        src={data?.user.avatar || "https://i.sstatic.net/lsh78.jpg"}
                                    />
                                </div>
                                <div className={`${darkMode ? "text-white" : "text-neutral-900"} font-[500] text-[12px] md:text-[16px]`}>
                                    {data?.user.fullName}
                                </div>
                                <button className={`border-2 px-3 md:px-3 mt-2 md:mt-3 py-1 rounded-[12px] mb-2 md:mb-0 text-[15px]  md:text-[18px] text-neutral-900 font-[500] hover:text-black transition-all duration-300 ease-in-out hover:scale-105  hover:shadow-sm ${darkMode ? "text-black bg-white  hover:shadow-fuchsia-400 hover:shadow-md" : "hover:shadow-stone-500"}`} >
                                    <span
                                        onClick={() => { navigating("/currentuserdetails") }}
                                        className={`${isLoggedIn == true ? "flex" : "hidden"}`}>Account Details</span>
                                    <span
                                        onClick={() => { navigating("/login") }}
                                        className={`${isLoggedIn == false ? "flex" : "hidden"}`}>Log In</span>
                                </button>
                            </div>
                            <div className={` ${darkMode ? "" : "text-stone-900"}  text-[10px] md:text-[12px] text-center mt-2 hidden md:flex  text-white/70 border-[1px] w-[260px]`}></div>
                            <div>
                                <div
                                    onClick={() => navigating("/createvideo")}
                                    className={`flex items-center transition-colors duration-200 ease-in-out mt-5 ${darkMode ? "text-white hover:text-white/95" : "text-slate-900 hover:text-black"}`}>
                                    <VideotapeIcon className=" mr-5 md:mr-7" size={24} />
                                    <span
                                        className="ml-2 hover:scale-105 transition-transform duration-200 ease-out md:text-[20px] text-[15px] font-[500]">Create Videos</span>
                                    <PlusCircle className={`ml-10 hover:scale-105  transition-transform hidden md:flex duration-200 ease-in-out ${darkMode ? "text-white/90 hover:text-white" : "text-black"} `} size={28} />
                                </div>
                                <div className={`flex items-center transition-colors duration-100 ease-in-out mt-5 ${darkMode ? "text-white hover:text-white/95" : "text-slate-900 hover:text-black"}`}>
                                    <Album className="mr-5 md:mr-7" size={24} />
                                    <span className="ml-2 hover:scale-105 transition-transform duration-200 ease-out md:text-[20px] text-[15px] font-[500]">Saved Topics</span>

                                </div>
                                <div className={`flex items-center transition-colors duration-100 ease-in-out mt-5 ${darkMode ? "text-white hover:text-white/95" : "text-slate-900 hover:text-black"}`}>
                                    <Bolt className="mr-5 md:mr-7" size={24} />
                                    <span className="ml-2 hover:scale-105 transition-transform duration-200 ease-out md:text-[20px] text-[15px] font-[500]">Enter PREP!</span>

                                </div>
                                <div className={`flex items-center transition-colors duration-100 ease-in-out mt-5 ${darkMode ? "text-white hover:text-white/95" : "text-slate-900 hover:text-black"}`}>
                                    <Airplay className="mr-5 md:mr-7" size={24} />
                                    <span className="ml-2 hover:scale-105 transition-transform hover:text-amber-200 duration-200 ease-out md:text-[20px] text-[15px] font-[500]">Join Edge</span>
                                </div>

                            </div>

                            <div className={` ${darkMode ? "text-white" : "text-stone-900"} text-[12px] mr-4 text-center mt-6  border-[1px] w-[85%]`}></div>

                            <button
                                onClick={() => setDarkMode(!darkMode)}
                                className="w-32 h-8 ml-[16px] md:ml-5 text-sm text-center flex py-2 font-[400] md:font-[300] justify-center items-center mt-3 rounded bg-gray-800 text-white hover:bg-gray-700"
                            >
                                Toggle Dark Mode
                            </button>

                            <div className="w-full mb-3 ml-[16px] md:ml-5">
                                <button
                                    onClick={HandleLogout}
                                    className={`w-32 py-2 h-8 font-[400] md:font-[300] text-sm text-center flex justify-center items-center mt-4 rounded bg-red-600 text-white hover:bg-red-500 ${isLoggedIn ? "flex" : "hidden"}`}
                                >
                                    Log Out
                                </button>
                            </div>

                        </div>
                    </div>
                </div>
            )}
            <div className={`hidden md:flex items-center w-full pb-1  px-10 ${darkMode ? "bg-black  text-white" : ""}`}>
                <form className="w-full flex items-center">
                    <input className={`w-[70%] pl-8 h-9 ${darkMode?"bg-neutral-800 text-white":"text-black bg-slate-300"}`} type="text"/>
                    <ScanSearch className="" size={30}/>
                </form>
                <div>Messages></div>
                <MessageCircleDashedIcon className="mr-3"/>
            </div>
        </>
    )
}

export default Navbar;