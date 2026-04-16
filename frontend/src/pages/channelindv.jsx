import React, { useState } from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
const ChannelIndv = () => {
    const {channelP}
    const [channel,setChannel]=useState(null);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const fetchVideos = async (pageNum = 1) => {
        try {
            setTimeout(() => {
                setData(false);
            }, 5000);
            const data = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/user/c/:${username}`);
            if (data.success) {
                setChannel(data)
                console.log(data)
            } else {
                console.error("Backend error:", data.message);
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
        }
    };
    return (
        <>
            <div>
                <div>
                    
                </div>
            </div>
        </>
    )
}

export default ChannelIndv
