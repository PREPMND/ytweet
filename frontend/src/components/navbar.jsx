import { useQuery } from "@tanstack/react-query";

import getCurrentUser from '../api/currentuser.jsx';
import logolight from "../assets/logolight.jpg"
const Navbar = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser
    });
    return (
        <>
            <div>
                <div className="flex items-center ">

                    <div className="flex items-center w-[30%]">

                        <img
                            className="rounded-[100%] object-cover w-10 h-10 ml-5
                                hover:scale-105 transition-transform duration-300 ease-in-out cursor-pointer
                                hover:ring-2 hover:ring-blue-500"

                            src={data?.user?.avatar} alt="User Avatar" />
                        <span className="ml-3 text-sm font-medium text-gray-700">{data?.user?.username}</span>
                    </div>


                    <div>
                        <img
                            className="w-10 h-10"
                            src={logolight} />
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar
