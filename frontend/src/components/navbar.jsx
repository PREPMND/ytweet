import { useQuery } from "@tanstack/react-query";
import getCurrentUser from '../api/currentuser.jsx';
import logolight from "../assets/logolight.jpg"
import logodark from "../assets/logodark..jpg"
import { Album, Airplay, Bolt, CirclePlus, VideotapeIcon } from "lucide-react"
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ menubar, setMenubar,darkModenav,setDarkModenav,darkMode,setDarkMode }) => {
    const [navigate, setNavigate] = useState(false);
    const [hoverBolt, setHoverBolt] = useState(false)
    const [hoverAlbum, setHoverAlbum] = useState(false);
    const [hoverAirplay, setHoverAirplay] = useState(false)

    const navigating = useNavigate();

    const { data, error } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        retry: false,
    });

    useEffect(() => {
        if (error?.response?.status === 401) {
            setNavigate(true);
        }
    }, [error]);

    return (
        <>
            <div className={darkModenav ? "bg-black  text-white" : ""}>
                <div className="flex items-center inset-0 z-0 h-[80px] justify-between select-none border-gray-700">

                    <div className="flex items-center h-[80px] gap-4 pl-5">
                        <img
                            onClick={() => setMenubar(true)}
                            className="rounded-full object-cover w-10 h-10 
                            hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer
                            hover:ring-2 hover:ring-blue-500"
                            src={data?.user?.avatar}
                            alt="User Avatar"
                        />
                        <span className={`hidden sm:block text-[18px] font-medium ${darkModenav ? "text-gray-200" : "text-gray-700"}`}>
                            {data?.user?.fullName}
                        </span>
                    </div>

                    <div className="w-fit sm:flex absolute hidden left-1/2 top-3">
                        <img className="w-12 h-12 object-cover" src={darkModenav ? logodark : logolight} />
                    </div>

                    <div className="flex items-center mt-4 gap-11 z-20 pr-4 sm:pr-9">

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAirplay(true)}
                            onMouseLeave={() => setHoverAirplay(false)}
                        >
                            <Airplay className={`${hoverAirplay ? "text-yellow-400" : "text-gray-400"}`} />
                            <span className={`text-[12px] mt-1 font-[600] transition-opacity duration-300 ${hoverAirplay ? "opacity-100" : "opacity-0"} ${darkModenav ? "text-gray-300" : "text-gray-600"}`}>
                                JoinEdge
                            </span>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAlbum(true)}
                            onMouseLeave={() => setHoverAlbum(false)}
                        >
                            <Album className={`${darkModenav ? "text-gray-300" : ""}`} />
                            <span className={`text-[12px] mt-1 font-[600] transition-opacity duration-300 ${hoverAlbum ? "opacity-100" : "opacity-0"} ${darkModenav ? "text-gray-300" : "text-gray-600"}`}>
                                Saved
                            </span>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverBolt(true)}
                            onMouseLeave={() => setHoverBolt(false)}
                        >
                            <Bolt className={`${hoverBolt ? "text-blue-400" : "text-gray-400"}`} />
                            <span className={`text-[11px] mt-1 font-[600] transition-opacity duration-300 ${hoverBolt ? "opacity-100" : "opacity-0"} ${darkModenav ? "text-gray-300" : "text-gray-600"}`}>
                                PREP
                            </span>
                        </div>

                        <button
                            onClick={() => setDarkModenav(!darkModenav)}
                            className="ml-4 px-3 py-1 text-sm rounded bg-gray-800 text-white hover:bg-gray-700"
                        >
                            Toggle
                        </button>
                    </div>
                </div>

                <div className={`w-full border-t ${darkModenav ? "border-gray-800" : ""}`}></div>
            </div>

            {navigate && (
                <div className="fixed inset-0 z-40 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black opacity-60"></div>

                    <div className={`relative w-[50%] h-[40%] rounded-lg shadow-lg flex flex-col items-center justify-center gap-6 z-50 ${darkModenav ? "bg-gray-900 text-white" : "bg-white"}`}>
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
                <div className="fixed inset-0 z-50 flex">
                    <div
                        className="absolute inset-0 bg-black opacity-60"
                        onClick={() => setMenubar(false)}
                    ></div>

                    <div className={`relative w-[60%] md:w-[40%] h-full shadow-lg flex flex-col pl-4 pt-5 gap-6 z-50 ${darkModenav ? "bg-gray-900 text-white" : "bg-white"}`}>
                        <div>
                            <button onClick={() => setDarkMode(!darkMode)} className="px-3 py-1 text-sm rounded bg-gray-800 text-white hover:bg-gray-700">
                                Toggle Dark Mode
                            </button>
                            <div className="flex items-center mt-5">
                                <VideotapeIcon className="font-[100] mr-6" size={40} fontWeight={100}/>
                                <span className="ml-2">Create Videos</span>
                            </div>
                            
                        </div>
                        
                    </div>
                </div>
            )}
        </>
    )
}

export default Navbar;