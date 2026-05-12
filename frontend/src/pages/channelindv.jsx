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
            setVideos(res.data.data); // match backend response structure
            console.log("Videos for channel:", res.data.data);
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
                {videos.map((video, index) => (
                    <div
                        className="flex justify-between mb-4"
                        key={video._id || index}>
                        
                        <div className="w-[80%] flex gap-5 ">
                            <img className=" object-cover ml-2 aspect-[16/9] rounded-md w-[40%]" src={video.thumbnail} alt={video.title} />
                            <h3 className="mt-2">{video.title}</h3>
                        </div>
                        <h1 className="mr-7">Options</h1>

                    </div>
                ))}
            </div>
        </div>
    )

};

export default ChannelIndv;