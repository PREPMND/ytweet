import { useQuery } from "@tanstack/react-query";
import getCurrentUser from '../api/currentuser.jsx';
import logolight from "../assets/logolight.jpg"
import { Album, Airplay, Bolt, Cross} from "lucide-react"
import { useState,useEffect} from "react";
import { useNavigate } from "react-router-dom";
const Navbar = () => {
    const [navigate, setNavigate] = useState(false);
    const [hoverBolt, setHoverBolt] = useState(false)
    const [hoverAlbum, setHoverAlbum] = useState(false);
    const [hoverAirplay, setHoverAirplay] = useState(false)
    const navigating = useNavigate();
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser
    });
    
    useEffect(() => {
        if (error?.response?.status === 401) {
            setNavigate(true);
        }
    }, [error]);
    return (
        <>
            <div>
                <div className="flex items-center h-[80px] justify-between">

                    <div className="flex items-center h-[80px] gap-4 pl-5">

                        <img
                            className="rounded-[100%] object-cover w-10 h-10 
                                hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer
                                hover:ring-2 hover:ring-blue-500"

                            src={data?.user?.avatar} alt="User Avatar" />
                        <span className="hidden sm:block text-[18px] font-medium  text-gray-700">{data?.user?.fullName}</span>

                    </div>
                    <div className="w-fit sm:flex absolute hidden left-1/2 top-3">
                        <img
                            className="w-12 h-12"
                            src={logolight} />
                    </div>
                    <div className="flex items-center  mt-4 gap-11 z-20 pr-4 sm:pr-9">
                        <div
                            className="flex flex-col mr:7 md:mr-14 items-center"
                            onMouseEnter={() => setHoverAirplay(true)}
                            onMouseLeave={() => setHoverAirplay(false)}
                        >
                            <Airplay className={`${hoverAirplay ? "text-yellow-400 shadow-sm shadow-yellow-300 " : ""}`} />
                            <span
                                className={`text-[12px] mt-1 text-gray-600 font-[600] transition-opacity duration-300 ${hoverAirplay ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                JoinEdge
                            </span>
                        </div>
                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAlbum(true)}
                            onMouseLeave={() => setHoverAlbum(false)}
                        >
                            <Album className={`${hoverAlbum ? "" : ""}`} />
                            <span
                                className={`text-[12px] mt-1 text-gray-600 font-[600] transition-opacity duration-300 ${hoverAlbum ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                Saved
                            </span>
                        </div>
                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverBolt(true)}
                            onMouseLeave={() => setHoverBolt(false)}
                        >
                            <Bolt className={`${hoverBolt ? "text-neutral-950" : "text-neutral-700"}`} />
                            <span
                                className={`text-[11px] mt-1 text-gray-600 font-[600] transition-opacity duration-300 ${hoverBolt ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                PREP
                            </span>
                        </div>

                    </div>
                </div>
                <div className="w-full border-[1px] ring-0">

                </div>
            </div>
            {
                navigate && <div className="w-[40%] h-[40%] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-lg shadow-lg flex flex-col items-center justify-center gap-6 z-40 inset-0 m-auto">
                    <h2 className="text-xl font-bold text-gray-800">Please log in to continue</h2>
                    <button onClick={() => navigating("/login")} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
                        Move to Login
                    </button>
                    <Cross onClick={() => setNavigate(false)} className="absolute top-3 right-3 cursor-pointer text-gray-500 hover:text-gray-700" />
                </div>
            }

        </>
    )
}

export default Navbar
