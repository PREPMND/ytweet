import React, { useEffect, useState } from 'react'
import { useQuery } from '@tanstack/react-query';
import getCurrentUser from '../api/currentuser';
import { useParams } from 'react-router-dom';
const ChannelIndv = (props) => {

    const { username: routeUsername } = useParams(); // from URL
    const [channel, setChannel] = useState(null);
    const [username, setUsername] = useState(routeUsername); // local state

    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });

    useEffect(() => {
        if (data?.user?.username) {
            setChannel(data.user.username);
            setUsername(data.user.username); // update state, not the param
        }
    }, [data]);

    console.log(channel);

    const fetchVideos = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/users/c/${username}`
            );
            const user = await res.json();
            console.log(user);
            if (user.success) {
                setChannel(user);
            }
        } catch (err) {
            console.error(err);
        }
    };
    useEffect(()=>{
        fetchVideos()
    },[])
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
