import React, { useEffect, useState } from "react";
import { EllipsisVertical } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
import api from "../api/api";
import { MenuDropdown } from "../utils/videoMenu";
const ChannelIndv = (props) => {
    const { profileSelected, darkMode } = props;
    const [subscribers, setSubscribers] = useState(0);
    const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState(false);
    const [videoSelected, setVideoSelected] = useState(true);
    const [yangSelected, setYangSelected] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [coverImage, setcoverImage] = useState(null);
    const [imageLoaded, setimageLoaded] = useState(false);
    const [videos, setVideos] = useState([]);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const subcriptionStatus = async () => {
        if (!data?.user) return;
        try {
            const res = await api.post(`/users/getchannel`, { username: profileSelected.owner.username }, { withCredentials: true });
            console.log(res.data.data);
        }
        catch (err) {
            console.log(err);
        }

    }
    const fetchuserById = async (Id) => {
        if (!Id) return;
        try {
            const res = await api.post("/users/userbyid", { Id });
            setcoverImage(res.data.data.coverImage)
        }
        catch (err) {
            console.log(err);
        }
    }
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
        subcriptionStatus();
    }, [profileSelected])
    useEffect(() => {
        channelVideo(profileSelected.owner._id);
    }, [data]);
    // dependency should be user id, not videos
    useEffect(() => {

        if (!profileSelected?.owner?._id) return;

        fetchuserById(profileSelected.owner._id);

    }, [profileSelected]);
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

        <div className={`relative ${darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}>
            {(!imageLoaded && loadingVideos  ) && (
                <div className="px-3 pt-9 space-y-5">
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
                                <div className={`${darkMode ? "*:bg-neutral-600 bg-neutral-800" : "bg-neutral-300"} *:rounded-md w-full aspect-video`}></div>
                                <div className="mt-3 space-y-2">
                                    <div className="h-4 bg-neutral-300 rounded w-[80%]"></div>
                                    <div className="h-4 bg-neutral-300 rounded w-[60%]"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className={`relative w-full ${!imageLoaded ? 'animate-pulse' : ''}`}>
                <img
                    onLoad={() => { setimageLoaded(true) }}
                    className={` -mt-5 inset-0  rounded-b-lg w-full h-[140px] object-cover `} src={coverImage} />
            </div>

            {(!loadingVideos && imageLoaded) && (
                <div className="flex mt-4 z-40 items-center ">
                    {/* the channel description */}

                    <img className="ml-4 md:ml-9 mb-4 rounded-full object-cover aspect-square
                w-[100px] h-[100px] md:h-[20%] md:w-[20%]" src={profileSelected.owner.avatar} alt={profileSelected.owner.username} />
                    <div className="flex pl-4 md:pl-10 justify-between font-[Saira] text-[20px] md:text-[28px] font-[500]  w-[70%] items-center h-[120px] ">
                        <div className={`${darkMode ? "text-white" : "text-black"}`}>
                            {profileSelected.owner.username}
                        </div>
                        <button onClick={() => setLocalSubscriptionStatus(!localSubscriptionStatus)} className={`bg-[#cc0000] ${localSubscriptionStatus ? "bg-neutral-700" : ""} text-white text-[15px] w-[100px] md:w-[120px] text-center md:text-[18px] px-2 mr-2 md:mr-4 transition-all duration-500 ease-in-out py-1 rounded-[12px] `}>
                            {localSubscriptionStatus ? "Unsubscribe " : "Subscribe"}
                        </button>
                    </div>
                </div>)}
            {(!loadingVideos && imageLoaded) && (
                <div className={`flex gap-2 mb-9 mt-9 ${darkMode ? "text-white" : "text-black"
                    }`}>
                    {/* some other thing */}
                    <div
                        onClick={() => {
                            setVideoSelected(true);
                            setYangSelected(false);
                        }}
                        className={`w-[50%] h-[2px] border-[2px]
${videoSelected
                                ? darkMode
                                    ? "border-white"
                                    : "border-black"
                                : darkMode
                                    ? "border-neutral-700"
                                    : "border-neutral-300"
                            }`}></div>
                    <div
                        onClick={() => {
                            setVideoSelected(false);
                            setYangSelected(true);
                        }}
                        className={`w-[50%] h-[2px] border-[2px]
${yangSelected
                                ? darkMode
                                    ? "border-white"
                                    : "border-black"
                                : darkMode
                                    ? "border-neutral-700"
                                    : "border-neutral-300"
                            }`}></div>

                </div>)}
            <div>
                {videos.map((video, index) => (

                    <div
                        className="flex md:flex-row flex-col  justify-between pb-4"
                        key={video._id || index}>

                        <div className={`w-full relative px-3 md:mx-0 flex `}>

                            <img
                                loading="lazy"
                                className="object-cover aspect-video rounded-md w-full md:w-[50%]"
                                src={video.thumbnail}
                                alt={video.title}
                            />
                            <h3
                                className={`md:mt-[1px] ml-5 hidden md:flex font-[600] text-[18px]
                                ${darkMode ? "text-white" : "text-black"}
                                ${video.title.length > 70 ? "whitespace-pre-wrap" : ""}`}
                            >{video.title}</h3>
                            <EllipsisVertical
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(video._id);
                                }}
                                className={`text-[18px] cursor-pointer hidden md:flex absolute right-1 mt-3 ${darkMode ? "text-white" : "text-black"
                                    }`} />
                            <MenuDropdown
                                className="bottom-[-10px] md:bottom-[40px] lg:right-5"
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
                            <h3
                                className={`mt-2 pl-[10px] font-[600] md:hidden flex text-[15px]
${darkMode ? "text-white" : "text-black"}`}
                            >{video.title}</h3>
                            <EllipsisVertical
                                onClick={(e) => {
                                    e.stopPropagation();
                                    toggleMenu(video._id);
                                }}
                                className={`text-[18px] cursor-pointer md:hidden absolute right-2 mt-3 ${darkMode ? "text-white" : "text-black"
                                    }`} />
                        </div>

                    </div>

                ))}

            </div>
        </div>
    )

};

export default ChannelIndv;