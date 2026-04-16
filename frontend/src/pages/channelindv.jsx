import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import getCurrentUser from '../api/currentuser';
import { useParams } from 'react-router-dom';
const ChannelIndv = (props) => {
    const {profileSelected,setProfileSelected}=props
    const {username}=useParams()
    const [channel,setChannel]=useState(null);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const fetchVideos = async () => {
        try {
            setTimeout(() => {
                
            }, 1000);
            const data = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/user/c/:${profileSelected}`);
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
