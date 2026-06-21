import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";
import { useInfiniteQuery } from "@tanstack/react-query";
import { MenuDropdown } from "../utils/videoMenu";
import { fetchVideos } from "../api/allcalls";
const VideoList = (props) => {
    const { darkMode, setProfileSelected, setvideoIdSelected, videoIdSelected } = props;

    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpenId, setMenuOpenId] = useState(null);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["videos"],
        queryFn: fetchVideos,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages
                ? lastPage.page + 1
                : undefined,
        staleTime: 1000*60*10,
    });
    const preloadImages = (urls) => {
        return Promise.all(
            urls.map(
                (url) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.src = url;
                        img.onload = resolve;
                        img.onerror = resolve;
                    })
            )
        );
    };

    

    
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
    useEffect(() => {
        const handleScroll = () => {

            if (isFetchingNextPage || !hasNextPage) return;

            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 500) {
                fetchNextPage();
            }
        };

        let ticking = false;

        const optimizedScroll = () => {
            if (!ticking) {
                window.requestAnimationFrame(() => {
                    handleScroll();
                    ticking = false;
                });

                ticking = true;
            }
        };

        window.addEventListener("scroll", optimizedScroll, {
            passive: true,
        });

        return () => {
            window.removeEventListener("scroll", optimizedScroll);
        };
    }, [isFetchingNextPage, hasNextPage]);
    useEffect(() => {
        if (location.state?.scrollY !== undefined) {
            window.scrollTo(0, location.state.scrollY);
        }
    }, [])
    function Handle(channelId, channelUsername, channel) {
        setProfileSelected(channel);
        navigate(`/${channelUsername}`);
    }

    function toggleMenu(id) {
        setMenuOpenId((prev) => (prev === id ? null : id));
    }

    function GoToVideo(vidDetails) {
        console.log("Selected Video Details:", vidDetails);
        navigate(`/watchvideo/${vidDetails._id}`, {
            state: { scrollY: window.scrollY }
        });
    }

    return (
        <div
            className={`relative overflow-hidden cursor-pointer transition-all duration-300 ease-out will-change-transform pt-9 transform-gpu ${darkMode ? "bg-black" : "bg-white"
                }`}
        >
            <div
                className="grid gap-5 place-content-center max-w-[1100px] mx-auto px-2"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(320px,1fr))",
                }}
            >
                {data?.pages
                    ?.flatMap((page) => page.docs)
                    .map((video, idx) => (
                        <div
                            key={`${video._id}-${idx}`}
                            onMouseEnter={() => {
                                timeoutRef.current = setTimeout(() => {
                                    setPlayingId(video._id);
                                }, 2000);
                            }}
                            onMouseLeave={() => {
                                clearTimeout(timeoutRef.current);
                                setPlayingId(null);
                            }}
                            className={`overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-out will-change-transform transform-gpu ${darkMode ? "bg-black" : "bg-white"
                                }`}
                        >
                            <div className="relative aspect-video select-none overflow-hidden rounded-xl bg-black">
                                {playingId === video._id ? (
                                    <video

                                        src={video.videoFile}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <img
                                        onClick={() => { GoToVideo(video) }}
                                        loading="lazy"
                                        decoding="async"
                                        fetchPriority="low"
                                        src={video.thumbnail}
                                        alt={video.title}
                                        className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                                    />
                                )}

                                <span
                                    className="absolute bottom-2 right-2 bg-black/90 text-white text-[14px] font-semibold px-2 py-[2px] rounded"
                                >
                                    {video.durationFormatted}
                                </span>
                            </div>

                            <div className="flex items-start gap-3 px-2 py-3">
                                <img
                                    onClick={() => {
                                        Handle(
                                            video.owner._id,
                                            video.owner.username,
                                            video
                                        );
                                    }}
                                    className="w-10 h-10 rounded-full object-cover shrink-0 hover:scale-105 transition-transform duration-300"
                                    src={video.owner.avatar}
                                    alt="Avatar"
                                    loading="lazy"
                                />
                                <div

                                    className="flex justify-between items-start gap-2 w-full min-w-0">

                                    <div

                                        className="flex flex-col flex-1 min-w-0"
                                    >
                                        <h3

                                            className={`text-[15px] leading-5 font-medium line-clamp-2 break-words ${darkMode
                                                ? "text-white"
                                                : "text-black"
                                                }`}
                                        >
                                            {video.title}
                                        </h3>

                                        <p
                                            onClick={() => {
                                                Handle(
                                                    video.owner._id,
                                                    video.owner.username,
                                                    video
                                                );
                                            }}
                                            className={`text-sm mt-1 hover:underline truncate ${darkMode
                                                ? "text-neutral-400"
                                                : "text-neutral-600"
                                                }`}
                                        >
                                            {video.owner.username}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMenu(video._id);
                                        }}
                                        className={`shrink-0 mt-1 p-1 rounded-full transition-colors ${darkMode
                                            ? "hover:bg-neutral-800 text-white"
                                            : "hover:bg-neutral-200 text-black"
                                            }`}
                                    >
                                        <EllipsisVertical size={18} />
                                    </button>
                                </div>
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
                        </div>
                    ))}
            </div>

            { isLoading ||isFetchingNextPage && (
                <div className="flex justify-center items-cente h-screen  py-10">
                    <LoaderPinwheel
                        className={`animate-spin ${darkMode
                            ? "text-white"
                            : "text-black"
                            }`}
                        size={38}
                    />
                </div>
            )}
        </div>
    );
};
export default VideoList;