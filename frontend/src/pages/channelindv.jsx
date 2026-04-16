import React from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
const ChannelIndv = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });

    return (
        <>
        <div>
            <div>
                <img src=''
            </div>
        </div>
        </>
    )
}

export default ChannelIndv
