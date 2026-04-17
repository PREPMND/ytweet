import React, { useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import getCurrentUser from '../api/currentuser';
import { useParams } from 'react-router-dom';
const ChannelIndv = (props) => {
    const {profileSelected,setProfileSelected}=props
    let {username}=useParams()
    username=profileSelected;
    const [channel,setChannel]=useState(null);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const fetchVideos = async () => {
        try {
            setTimeout(() => {
                
            }, 1000);
            const user = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/user/c/:${username}`);
            console.log(user)
            if (user.success) {
                setChannel(user)
                console.log(user)
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
