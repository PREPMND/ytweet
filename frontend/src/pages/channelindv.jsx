import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { EllipsisVertical, Mails } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import getCurrentUser from "../api/currentuser";
import api from "../api/api";
import { MenuDropdown } from "../utils/videoMenu";
const ChannelIndv = (props) => {
    const { darkMode } = props;
    const [localSubscriptionStatus, setLocalSubscriptionStatus] = useState(false);
    const [videoSelected, setVideoSelected] = useState(true);
    const [yangSelected, setYangSelected] = useState(false);
    const [loadingVideos, setLoadingVideos] = useState(false);
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [coverImage, setcoverImage] = useState(null);
    const [imageLoaded, setimageLoaded] = useState(false);
    const [videos, setVideos] = useState([]);
    const [pageLoading, setPageLoading] = useState(true);

    const [subscribers, setSubscribers] = useState(0);

    const navigate = useNavigate();
    const { username } = useParams();
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });

    const [channel, setChannel] = useState(null);

    async function loadChannel() {
        try {
            const res = await api.post("/users/getchannel", {
                username: username
            });

            setChannel(res.data.data);
            setcoverImage(res.data.data.coverImage);

        } catch (err) {
            console.log(err);
        }
    }

    async function channelVideo(ownerId) {
        setLoadingVideos(true);

        try {
            const res = await api.post("/videos/any", {
                owner: ownerId,
            });

            setVideos(res.data.data);
            setLocalSubscriptionStatus(channel.isSubscribed);
            setSubscribers(channel.subscriberCount);
        } catch (err) {
            console.log(err);
        } finally {
            setLoadingVideos(false);
        }
    }
    async function handleSubscription() {
        if (!channel?._id) return;

        try {
            const res = await api.post(
                `users/subscriptions/${channel._id}`
            );

            const subscribed = res.data.subscribed;

            setLocalSubscriptionStatus(subscribed);

            setSubscribers((prev) =>
                subscribed ? prev + 1 : Math.max(prev - 1, 0)
            );

        } catch (err) {
            console.log(err);
        }
    }
    useEffect(() => {
        if (!username) return;

        loadChannel();
    }, [username]);
    useEffect(() => {
        if (!channel?._id) return;
        channelVideo(channel._id);
    }, [channel]);
    // dependency should be user id, not videos
    useEffect(() => {
        if (!coverImage) return;
        const img = new Image();
        img.src = coverImage;
        img.onload = () => {
            setimageLoaded(true);
        };
    }, [coverImage]);
    useEffect(() => {
        if (
            imageLoaded &&
            !loadingVideos &&
            coverImage
        ) {
            setPageLoading(false);
        }
    }, [imageLoaded, loadingVideos, coverImage, videos]);

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
    const messageUser = (receiverId) => {
        console.log("Messaging user with ID:", receiverId);
        navigate(`/message/${receiverId}`);
    };
    return (

        <div className={`relative min-h-screen ${darkMode ? "bg-black text-white" : "bg-white text-black"
            }`}>
            {pageLoading ? (
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
            ) : (
                <div>
                    <div className={`relative w-full`}>
                        <img
                            onLoad={() => { setimageLoaded(true) }}
                            className={` -mt-5 inset-0  rounded-b-lg w-full h-[140px] object-cover `} src={coverImage} />
                    </div>


                    <div className="flex mt-4 z-40 items-center ">
                        {/* the channel description */}

                        <img className="ml-4 md:ml-9 mb-4 rounded-full object-cover aspect-square
                w-[100px] h-[100px] md:h-[20%] md:w-[20%]" src={channel?.avatar} alt={channel?.username} />
                        <div className="flex pl-4 md:pl-10 justify-between font-[Saira] text-[20px] md:text-[28px] font-[500]  w-[70%] items-center h-[120px] ">
                            <div className={`${darkMode ? "text-white" : "text-black"}`}>
                                {channel?.username}
                            </div>

                        </div>
                        <Mails
                            onClick={() => messageUser(channel?._id)}
                            className={`mr-4 `} size={28} />
                    </div>

                    <div className="flex mt-4 justify-evenly">
                        <button onClick={() => handleSubscription(channel?._id)} className={`bg-[#cc0000] ${localSubscriptionStatus ? "bg-neutral-700" : ""} text-white text-[15px] w-[100px] md:w-[120px] text-center md:text-[18px] px-2 mr-2 md:mr-4 transition-all duration-500 ease-in-out py-1 rounded-[12px] `}>
                            {localSubscriptionStatus ? "Unsubscribe " : "Subscribe"}
                        </button>
                        <button className={` text-white text-[15px] w-[100px] md:w-[120px] text-center md:text-[18px] px-2 mr-2 md:mr-4 transition-all duration-500 ease-in-out py-1 rounded-[12px]`}>
                            Follow
                        </button>
                    </div>


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

                    </div>

                    <div className="min-h-[50vh]">
                        {videos.length === 0 ? (
                            <p className={`m-auto ${darkMode ? "text-gray-400 bg-neutral-800" : "text-gray-600"} text-center h-[70vw] md:h-[10vw] mt-2`}>
                                No videos found.
                            </p>
                        ) : (
                            videos.map((video, index) => (
                                <div
                                    className="flex md:flex-row flex-col  justify-between pb-4"
                                    key={video._id || index}>

                                    <div className={`w-full relative px-3 md:mx-0 flex `}>

                                        <img
                                            onClick={() => navigate(`/watchvideo/${video._id}`)}
                                            loading="lazy"
                                            className="object-cover aspect-video rounded-md w-full md:w-[50%]"
                                            src={video.thumbnail}
                                            alt={video.title}
                                        />
                                        <h3
                                            className={`md:mt-[1px] mt-3 ml-5 hidden  md:flex font-[600] text-[16px] line-clamp-2 
                                ${darkMode ? "text-white" : "text-black"}
                                `}
                                        >{video.title}</h3>
                                        <EllipsisVertical
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(video._id);
                                            }}
                                            className={` cursor-pointer hidden md:flex absolute right-1 mt-3 ${darkMode ? "text-white" : "text-black"
                                                }`} size={18} />
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

                                    <div className="flex md:hidden items-start md:h-auto h-12 md:px-0 px-2 mb-5 md:mb-0 justify-between md:w-auto w-full gap-2 ">
                                        <h3
                                            className={`mt-4 mb-2 font-[Saira] pl-[10px] w-[95%] font-[500] md:hidden line-clamp-2 flex text-[16px]
${darkMode ? "text-white" : "text-black"}`}
                                        >{video.title}</h3>
                                        <EllipsisVertical
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                toggleMenu(video._id);
                                            }}
                                            className={` cursor-pointer md:hidden absolute right-2 mt-4 ${darkMode ? "text-white" : "text-black"
                                                }`} size={20} />
                                    </div>

                                </div>


                            )))}
                    </div>
                </div>
            )}
        </div>
    );
}







export default ChannelIndv;