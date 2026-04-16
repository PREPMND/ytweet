import React from 'react'
import axios from 'axios'
import { useQuery } from '@tanstack/react-query';
const ChannelIndv = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const fetchVideos = async (pageNum = 1) => {
        try {
            setTimeout(() => {
                setData(false);
            }, 5000);
            const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/user/`);
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.docs);
                setData(true);
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
                    <img src=''
            </div>
            </div>
        </>
    )
}

export default ChannelIndv
