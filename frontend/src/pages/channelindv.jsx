import React, { useEffect, useState } from "react";
import {EllipsisVertical} from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";

const ChannelIndv = (props) => {
    const {profileSelected} = props;
    const [subscribers, setSubscribers] = useState(0);
    const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState(false);
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
            <div className="flex mt-5 md:mt-3 h-[140px] md:h[180px] items-center ">
            {/* the channel description */}
            <img className="ml-9 rounded-[100%] w-[100px] md:h-[30%]" src={data.user.avatar} alt={data.user.name} />
            <div className="flex ml-10 justify-between font-[Saira] text-[20px] md:text-[28px] font-[500] w-[70%] items-center h-[120px] ">
                <div className="">{data.user.username}</div>
                <button onClick={() => setLocalSubscriptionStatus(!localSubscriptionStatus)} className={`bg-[#cc0000] text-white text-[18px] md:text-[20px] px-4 py-2 rounded-[12px] mr-4 `}>
                    {localSubscriptionStatus ? "Unsubscribe" : "Subscribe"}
                </button>
            </div>
            </div>
            <div>
            //some other thing
            </div>
            <div>
                {videos.map((video, index) => (
                    <div
                        className="flex md:flex-row flex-col justify-between mb-4"
                        key={video._id || index}>
                        
                        <div className="w-full md:w-[80%] px-3 md:mx-0 flex  ">
                            <img className="object-cover aspect-[16/9] rounded-md w-[100%] md:w-[50%]" src={video.thumbnail} alt={video.title} />
                            <h3 className={`md:mt-[1px] ml-5 hidden md:flex font-[600] text-[18px] 
                                ${video.title.length > 70 ?"whitespace-pre-wrap" : ""}`}>{video.title}</h3>
                            <EllipsisVertical className="text-[18px]  cursor-pointer absolute right-3 mt-3"  />
                        </div>
                        <div className="flex md:hidden items-start md:h-auto h-12 md:px-0 px-2 mb-3 md:mb-0 justify-between md:w-auto w-full gap-2 ">
                            <h3 className="mt-2 pl-[10px] font-[600] md:hidden flex text-[15px] md:text-[18px]">{video.title}</h3>
                            <EllipsisVertical className="text-[18px]  cursor-pointer absolute right-2 mt-3"  />
                        </div>
                        

                    </div>
                ))}
            </div>
        </div>
    )

};

export default ChannelIndv;