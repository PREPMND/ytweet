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
                        className="rounded-full object-cover"
                        src={data?.user?.avatar} alt="User Avatar" width={50} height={50} />
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar
