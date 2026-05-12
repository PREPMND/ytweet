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
    console.log("CURRENT USER DATA:", data.user._id);
    const channelVideo = async (ownerId) => {
        try {
            const res = await api.post("/videos/any", { owner: ownerId });
            setVideos(res); // match backend response structure
            console.log("Videos for channel:", res);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        channelVideo(data.user._id);
    }, [data]); // dependency should be user id, not videos


    return (
        <div>
        <div>
            //the channel description
        </div>
        <div>
            //some other thing
        </div>
        <div>
            ${vedios.map}
        </div>
        </div>
    )

};

export default ChannelIndv;