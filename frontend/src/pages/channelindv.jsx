import React, { useEffect, useState } from "react";
import {EllipsisVertical} from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";

const ChannelIndv = (props) => {
    const {profileSelected} = props;
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
        channelVideo(profileSelected);
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
                        className="flex md:flex-row flex-col justify-between mb-4"
                        key={video._id || index}>
                        
                        <div className="w-full md:w-[80%] px-3 md:mx-0 flex gap-5 ">
                            <img className="object-cover aspect-[16/9] rounded-md w-[100%] md:w-[50%]" src={video.thumbnail} alt={video.title} />
                            <h3 className={`mt-2 hidden  md:flex font-[600] text-[18px] 
                                ${video.title.length > 60 ?"whitespace-pre-wrap" : ""}`}>{video.title}</h3>
                        </div>
                        <div className="flex items-center ml-2 mb-3 md:mb-0 justify-between
                        w-full ">
                            <h3 className="mt-2 pl-[10px] font-[600] md:hidden flex text-[15px] md:text-[18px]">{video.title}</h3>
                            <h1 className="mr-7">Options</h1>
                            <EllipsisVertical className="mr-3 cursor-pointer" size={20} />
                        </div>
                        

                    </div>
                ))}
            </div>
        </div>
    )

};

export default ChannelIndv;