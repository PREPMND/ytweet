import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";

const ChannelIndv = () => {
    const [videos, setVideos] = useState([]);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    console.log("CURRENT USER DATA:", data);
    const channelVideo = (ownerId) => {
        const videoArray =await api.get("/videos/any", { owner: data.user._id });
        setVideos(videoArray);
    }
    useEffect(() => {
            channelVideo(data.user._id);
    }, [videos]);
    console.log("Channel Videos:", videos); 


    return (
        <div>ieifhwe</div>
    )
            
};

export default ChannelIndv;