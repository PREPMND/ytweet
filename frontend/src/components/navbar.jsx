import { useQuery } from "@tanstack/react-query";

import getCurrentUser from '../api/currentuser.jsx';
import logolight from "../assets/logolight.jpg"

import { Album, Airplay, Bolt, Cannabis } from "lucide-react"
import { useState } from "react";
const Navbar = () => {
    const [hoverBolt, setHoverBolt] = useState(false)
    const [hoverAlbum, setHoverAlbum] = useState(false);
    const [hoverAirplay, setHoverAirplay] = useState(false)
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser
    });
    return (
        <>
            <div>
                <div className="flex items-center h-[80px] justify-between">

                    <div className="flex items-center gap-4 pl-5">

                        <img
                            className="rounded-[100%] object-cover w-10 h-10 
                                hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer
                                hover:ring-2 hover:ring-blue-500"

                            src={data?.user?.avatar} alt="User Avatar" />
                        <span className=" text-sm font-medium text-gray-700">{data?.user?.username}</span>
                    </div>


                    <div className="w-fit absolute left-1/2 top-3">
                        <img
                            className="w-12 h-12"
                            src={logolight} />
                    </div>
                    <div className="flex items-center mt-4 gap-11 z-20 pr-5">
                        <div
                            className="flex flex-col pr-14 items-center"
                            onMouseEnter={() => setHoverBolt(true)}
                            onMouseLeave={() => setHoverBolt(false)}
                        >
                            <Bolt className={`${hoverBolt?"text-neutral-950":"text-neutral-700"}`}  size={28} />
                            <span
                                className={`text-[10px] text-gray-600 font-[600] mt-1 transition-opacity duration-300 ${hoverBolt ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                PREP
                            </span>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAlbum(true)}
                            onMouseLeave={() => setHoverAlbum(false)}
                        >
                            <Album className={`${hoverAlbum?"text-yellow-400":""}`} />
                            <span
                                className={`text-[10px] mt-1 text-gray-600 font-[600] transition-opacity duration-300 ${hoverAlbum ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                Saved
                            </span>
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAirplay(true)}
                            onMouseLeave={() => setHoverAirplay(false)}
                        >
                            <Airplay className={`${hoverAirplay?"text-yellow-400 shadow-lg shadow-yellow-300 scale-105":""}`}/>
                            <span
                                className={`text-[10px] mt-1 text-gray-600 font-[600] transition-opacity duration-300 ${hoverAirplay ? "opacity-100" : "opacity-0"
                                    }`}
                            >
                                JoinEdge
                            </span>
                        </div>
                    </div>
                </div>
                <div className="w-full border-[1px] ring-0">

                </div>
            </div>

        </>
    )
}

export default Navbar
