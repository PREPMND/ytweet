import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";
const VideoList = (props) => {
    const { darkMode, setProfileSelected } = props;

    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();
    const [menuOpenId, setMenuOpenId] = useState(null);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [loading, setLoading] = useState(false);

    const fetchVideos = async (pageNum = 1) => {
        if (loading || !hasMore) return;

        try {
            setLoading(true);

            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/videos/getvideos?page=${pageNum}&limit=20`
            );

            const data = await res.json();

            if (data.success) {

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
    return (
        <div
            className={`relative overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-out will-change-transform transform-gpu ${darkMode ? "bg-black" : "bg-white"
                }`}
        >
            <div
                className="grid gap-5 max-w-[1100px] mx-auto"
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
                            }, 250);
                        }}
                        onMouseLeave={() => {
                            clearTimeout(timeoutRef.current);
                            setPlayingId(null);
                        }}
                        className={`overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-out will-change-transform transform-gpu ${darkMode ? "bg-black" : "bg-white"
                            }`}
                    >
                        <div className="relative overflow-hidden rounded-xl bg-black">
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
                                    loading="lazy"
                                    decoding="async"
                                    fetchpriority="low"
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
                                onClick={() => {
                                    Handle(
                                        video.owner._id,
                                        video.owner.username,
                                        video
                                    );
                                }}
                                className="flex flex-col overflow-hidden"
                            >
                                <h3
                                    className={`text-[15px] leading-5 font-medium line-clamp-2 ${darkMode
                                        ? "text-white"
                                        : "text-black"
                                        }`}
                                >
                                    {video.title}
                                </h3>

                                <p
                                    className={`text-sm mt-1 hover:underline ${darkMode
                                        ? "text-neutral-400"
                                        : "text-neutral-600"
                                        }`}
                                >
                                    {video.owner.username}
                                </p>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleMenu(video._id);
                                    }}
                                    className={`absolute bottom-6 right-2 z-30 p-1.5 rounded-full transition-all duration-200 ${darkMode
                                        ? "bg-black/60 hover:bg-black/80 text-white"
                                        : "bg-white/80 hover:bg-white text-black"
                                        }`}
                                >
                                    <EllipsisVertical size={18} />
                                </button>
                                {menuOpenId === video._id && (
                                    <div
                                        className={`absolute top-10 right-3 z-40 min-w-[220px] overflow-hidden rounded-xl shadow-xl border ${darkMode
                                            ? "bg-neutral-900 border-neutral-700 text-white"
                                            : "bg-white border-neutral-200 text-black"
                                            }`}
                                    >
                                        <button
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${darkMode
                                                ? "hover:bg-neutral-800"
                                                : "hover:bg-neutral-100"
                                                }`}
                                        >
                                            Watch later
                                        </button>

                                        <button
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${darkMode
                                                ? "hover:bg-neutral-800"
                                                : "hover:bg-neutral-100"
                                                }`}
                                        >
                                            Save to playlist
                                        </button>

                                        <button
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${darkMode
                                                ? "hover:bg-neutral-800"
                                                : "hover:bg-neutral-100"
                                                }`}
                                        >
                                            Share
                                        </button>

                                        <button
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${darkMode
                                                ? "hover:bg-neutral-800"
                                                : "hover:bg-neutral-100"
                                                }`}
                                        >
                                            Not interested
                                        </button>

                                        <button
                                            className={`w-full text-left px-4 py-3 text-sm transition-colors ${darkMode
                                                ? "hover:bg-neutral-800"
                                                : "hover:bg-neutral-100"
                                                }`}
                                        >
                                            Report
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {loading && (
                <div className="flex justify-center items-center py-10">
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