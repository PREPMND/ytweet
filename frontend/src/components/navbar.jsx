import { useQuery } from "@tanstack/react-query";

import getCurrentUser from '../api/currentuser.jsx';
const Navbar = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser
    });
    return (
        <>
            <div>
                <div>
                    <div>
                        <img 
                        className="rounded-[100%] object-cover w-10 ml-5 mt-2 "
                        src={data?.user?.avatar} alt="User Avatar" />
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar
