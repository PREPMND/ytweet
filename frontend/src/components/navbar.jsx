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


                    <div className="w-fit">
                        <img
                            className="w-12 h-12"
                            src={logolight} />
                    </div>
                    <div className="flex items-center mt-4 gap-10 z-20 pr-5">
                        <div
                            className="flex flex-col transition-transform duration-300 ease-in-out items-center"
                            onMouseEnter={() => setHoverBolt(true)}
                            onMouseLeave={() => setHoverBolt(false)}
                        >
                            <Bolt size={28} />
                            {hoverBolt && <span className="text-[10px] mt-1">Prep</span>}
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAlbum(true)}
                            onMouseLeave={() => setHoverAlbum(false)}
                        >
                            <Album />
                            {hoverAlbum && <span className="text-[10px] mt-1">Prep</span>}
                        </div>

                        <div
                            className="flex flex-col items-center"
                            onMouseEnter={() => setHoverAirplay(true)}
                            onMouseLeave={() => setHoverAirplay(false)}
                        >
                            <Airplay />
                            {hoverAirplay && <span className="text-[10px] mt-1">Prep</span>}
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
