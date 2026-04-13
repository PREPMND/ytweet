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

                    </div>
                </div>
            </div>

        </>
    )
}

export default Navbar
