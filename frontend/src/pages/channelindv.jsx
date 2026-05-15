import React, { useEffect, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";
import { MenuDropdown } from "../utils/videoMenu";
const ChannelIndv = (props) => {
    const { profileSelected, darkMode } = props;
    console.log("PROFILE SELECTED:", profileSelected);
    const [subscribers, setSubscribers] = useState(0);
    const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState(false);
    const [videoSelected, setVideoSelected] = useState(true);
    const [yangSelected, setYangSelected] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [videos, setVideos] = useState([]);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const channelVideo = async (ownerId) => {
        setLoadingVideos(true);
        try {
            const res = await api.post("/videos/any", { owner: ownerId });
            setVideos(res.data.data);
            // match backend response structure
            setLoadingVideos(false);
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        channelVideo(profileSelected.owner._id);
    }, [data]); // dependency should be user id, not videos
    function toggleMenu(id) {
        setMenuOpenId((prev) => (prev === id ? null : id));
    }

    function handleWatchLater(video) {
        console.log("Watch later:", video);
    }
    function handlePlaylist(video) {
        console.log("Save to playlist:", video);
    }
    function handleShare(video) {
        console.log("Share:", video);
    }
    function handleNotInterested(video) {
        console.log("Not interested:", video);
    }
    function handleReport(video) {
        console.log("Report:", video);
    }
    return (

        <div className="relative">
            {loadingVideos && (
                <div className="px-3 space-y-5">
                    {/* Mobile layout */}
                    <div className="md:hidden space-y-5">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-neutral-300 rounded-md w-full aspect-video"></div>
                                <div className="mt-3 space-y-2">
                                    <div className="h-4 bg-neutral-300 rounded w-[80%]"></div>
                                    <div className="h-4 bg-neutral-300 rounded w-[60%]"></div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Desktop layout */}
                    <div className="hidden md:grid md:grid-cols-1 aspect-video md:max-w-[40%] md:gap-6">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="animate-pulse">
                                <div className="bg-neutral-300 rounded-md w-full aspect-video"></div>
                                <div className="mt-3 space-y-2">
                                    <div className="h-4 bg-neutral-300 rounded w-[80%]"></div>
                                    <div className="h-4 bg-neutral-300 rounded w-[60%]"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
            {!loadingVideos && (
                <div className="relative w-full">
                    <img className="-z-30 -mt-5 inset-0 absolute w-full h-[100px] " src={data.user.coverImage} />
                </div>
            )}
            {!loadingVideos && (
                <div className="flex mt-5 md:mt-3 z-40 items-center ">
                    {/* the channel description */}

                    <img className="ml-6 md:ml-9 rounded-full object-cover aspect-square
                w-[100px] h-[100px] md:h-[20%] md:w-[20%]" src={profileSelected.owner.avatar} alt={profileSelected.owner.username} />
                    <div className="flex pl-6 md:pl-10 justify-between font-[Saira] text-[20px] md:text-[28px] font-[500] w-[70%] items-center h-[120px] ">
                        <div className="">{profileSelected.owner.username}</div>
                        <button onClick={() => setLocalSubscriptionStatus(!localSubscriptionStatus)} className={`bg-[#cc0000] ${localSubscriptionStatus ? "bg-neutral-700" : ""} text-white text-[18px] w-[120px] text-center md:text-[18px] px-2 mr-2 md:mr-4 transition-all duration-500 ease-in-out py-1 rounded-[12px] `}>
                            {localSubscriptionStatus ? "Unsubscribe " : "Subscribe"}
                        </button>
                    </div>
                </div>)}
            {!loadingVideos && (
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

                </div>)}
            <div>
                {videos.map((video, index) => (

                    <div
                        className="flex md:flex-row flex-col justify-between mb-4"
                        key={video._id || index}>

                        <div className="w-full md:w-[80%] px-3 md:mx-0 flex  ">

                            <img
                                loading="lazy"
                                className="object-cover aspect-video rounded-md w-full md:w-[50%]"
                                src={video.thumbnail}
                                alt={video.title}
                            />
                            <h3 className={`md:mt-[1px] ml-5 hidden md:flex font-[600] text-[18px] 
                                ${video.title.length > 70 ? "whitespace-pre-wrap" : ""}`}>{video.title}</h3>
                            <EllipsisVertical
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(video._id);
                                }}
                                className="text-[18px]  cursor-pointer hidden md:flex absolute right-3 mt-3" />
                            <MenuDropdown
                                isOpen={menuOpenId === video._id}
                                darkMode={darkMode}
                                items={[
                                    {
                                        label: "Watch later",
                                        onClick: () => handleWatchLater(video),
                                    },
                                    {
                                        label: "Save to playlist",
                                        onClick: () => handlePlaylist(video),
                                    },
                                    {
                                        label: "Share",
                                        onClick: () => handleShare(video),
                                    },
                                    {
                                        label: "Not interested",
                                        onClick: () => handleNotInterested(video),
                                    },
                                    {
                                        label: "Report",
                                        onClick: () => handleReport(video),
                                    },
                                ]}
                            />
                        </div>

                        <div className="flex md:hidden items-start md:h-auto h-12 md:px-0 px-2 mb-3 md:mb-0 justify-between md:w-auto w-full gap-2 ">
                            <h3 className="mt-2 pl-[10px] font-[600] md:hidden flex text-[15px] md:text-[18px]">{video.title}</h3>
                            <EllipsisVertical
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(video._id);
                                }}
                                className="text-[18px]  cursor-pointer md:hidden absolute right-2 mt-3" />
                        </div>

                    </div>

                ))}

            </div>
        </div>
    )

};

export default ChannelIndv;