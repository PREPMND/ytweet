import React from 'react'
import getCurrentUser from './currentuser';

const getvideo = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser, // You need to implement this function to fetch video by ID
    });
    data.re
    return (
        <div>

        </div>
    )
}

export default getvideo
