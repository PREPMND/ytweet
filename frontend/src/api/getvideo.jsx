import React from 'react'
import getCurrentUser from './currentuser';

const getVideo = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser, // You need to implement this function to fetch video by ID
    });
    const currentUserId = data?.user?._id;
    
    return (
        <div>

        </div>
    )
}

export default getVideo
