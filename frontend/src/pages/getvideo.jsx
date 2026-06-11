import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";

import { MenuDropdown } from "../utils/videoMenu";
const VideoList = (props) => {
    const { darkMode, setProfileSelected, setvideoIdSelected,videoIdSelected } = props;

    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);
    const preloadImages = (urls) => {
        return Promise.all(
            urls.map(
                (url) =>
                    new Promise((resolve) => {
                        const img = new Image();
                        img.src = url;
                        img.onload = resolve;
                        img.onerror = resolve; // resolve even if error, so it doesn't hang
                    })
            )
        );
    };

    const fetchVideos = async (pageNum = 1) => {
        if (loading || !hasMore) return;

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/videos/getvideos?page=${pageNum}&limit=6`,
            );

            const data = await res.json();
            if (data.success) {
                const newVideos = data.data.docs;
                await preloadImages(newVideos.map((v) => v.thumbnail));

                setVideos((prev) => {
                    const existingIds = new Set(prev.map(v => v._id));
                    const filtered = data.data.docs.filter(
                        v => !existingIds.has(v._id)
                    );

                    return [...prev, ...filtered];
                });

                setHasMore(pageNum < data.data.totalPages);
            } else {
                console.error("Backend error:", data.message);
            }

        } catch (err) {
            console.error("Error fetching videos:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchVideos(page);
    }, [page]);
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

            if (loading || !hasMore) return;

            const scrollTop = window.scrollY;
            const windowHeight = window.innerHeight;
            const documentHeight = document.documentElement.scrollHeight;

            if (scrollTop + windowHeight >= documentHeight - 500) {
                setPage((prev) => prev + 1);
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
    }, [loading, hasMore]);

    function Handle(channelId, channelUsername, channel) {
        setProfileSelected(channel);
        navigate(`/${channelUsername}`);
    }

    function toggleMenu(id) {
        setMenuOpenId((prev) => (prev === id ? null : id));
    }
    
        function GoToVideo(vidDetails) {
            setvideoIdSelected(vidDetails);
            navigate("/watchvideo");
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
                {videos.map((video, idx) => (
                    <div
                        key={`${video._id}-${idx}`}
                        onMouseEnter={() => {
                            timeoutRef.current = setTimeout(() => {
                                setPlayingId(video._id);
                            }, 500);
                        }}
                        onMouseLeave={() => {
                            clearTimeout(timeoutRef.current);
                            setPlayingId(null);
                        }}
                        className={`overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-out will-change-transform transform-gpu ${darkMode ? "bg-black" : "bg-white"
                            }`}
                    >
                        <div className="relative select-none overflow-hidden rounded-xl bg-black">
                            {playingId === video._id ? (
                                <video
                                    
                                    src={video.videoFile}
                                    autoPlay
                                    muted
                                    loop
                                    playsInline
                                    preload="metadata"
                                    className="w-full aspect-video object-cover"
                                />
                            ) : (
                                <img
                                    onClick={()=>{GoToVideo(video)}}
                                    loading="lazy"
                                    decoding="async"
                                    fetchPriority="low"
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full aspect-video object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
                                />
                            )}

                            <span
                                className="absolute bottom-2 right-2 bg-black/90 text-white text-xs font-semibold px-2 py-[2px] rounded"
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

            {loading && (
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