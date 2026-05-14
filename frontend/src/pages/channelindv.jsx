import React, { useEffect, useState } from "react";
import {EllipsisVertical} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";

const ChannelIndv = (props) => {
    const {profileSelected} = props;
    console.log("PROFILE SELECTED:", profileSelected);
    const [subscribers, setSubscribers] = useState(0);
    const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState(false);
    const [videoSelected, setVideoSelected] = useState(true);
    const [yangSelected, setYangSelected] = useState(false);
    const [videos, setVideos] = useState([]);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const channelVideo = async (ownerId) => {
        try {
            const res = await api.post("/videos/any", { owner: ownerId });
            setVideos(res.data.data); // match backend response structure
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        channelVideo(profileSelected.owner._id);
    }, [data]); // dependency should be user id, not videos


    return (
        <div className="relative">
            <div className="relative w-screen">
                <img  className="-z-30 -mt-5 inset-0 absolute w-screen h-[100px] " src={profileSelected.owner.coverImage} />
            </div>
            <div className="flex mt-5 md:mt-3 z-40 items-center ">
            {/* the channel description */}
            
            <img className="ml-6 md:ml-9 rounded-[100%] w-[100px] h-[100px] md:h-[20%] md:w-[20%]" src={profileSelected.owner.avatar} alt={profileSelected.username} />
            <div className="flex pl-6 md:pl-10 justify-between font-[Saira] text-[20px] md:text-[28px] font-[500] w-[70%] items-center h-[120px] ">
                <div className="">{data.user.username}</div>
                <button onClick={() => setLocalSubscriptionStatus(!localSubscriptionStatus)} className={`bg-[#cc0000] ${localSubscriptionStatus ? "bg-neutral-700" : ""} text-white text-[18px] w-[120px] text-center md:text-[18px] px-2 mr-2 md:mr-4 transition-all duration-500 ease-in-out py-1 rounded-[12px] `}>
                    {localSubscriptionStatus ? "Unsubscribe " : "Subscribe"}
                </button>
            </div>
            </div>
            <div className="flex gap-2 mb-5 mt-5 text-black">
            {/* some other thing */}
            <div
            onClick={() => {
                setVideoSelected(true);
                setYangSelected(false);
            }}
            className={`w-[50%] h-[2px] border-[2px] ${videoSelected ? "border-black h-[1.5px]" : "border-red-300"}  `}></div>
            <div
            onClick={() => {
                setVideoSelected(false);
                setYangSelected(true);
            }}
            className={`w-[50%] h-[2px] border-[2px]  ${yangSelected ? "border-black h-[1.5px]" : "border-amber-200"}  `}></div>

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
                            <EllipsisVertical className="text-[18px]  cursor-pointer hidden md:flex absolute right-3 mt-3"  />
                        </div>
                        <div className="flex md:hidden items-start md:h-auto h-12 md:px-0 px-2 mb-3 md:mb-0 justify-between md:w-auto w-full gap-2 ">
                            <h3 className="mt-2 pl-[10px] font-[600] md:hidden flex text-[15px] md:text-[18px]">{video.title}</h3>
                            <EllipsisVertical className="text-[18px]  cursor-pointer md:hidden absolute right-2 mt-3"  />
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )

};

export default ChannelIndv;