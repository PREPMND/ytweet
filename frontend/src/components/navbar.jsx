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
                        <img src={data?.user?.avatarUrl} alt="User Avatar" width={50} height={50} />
                        <span>{data?.user?.email}</span>
                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar
