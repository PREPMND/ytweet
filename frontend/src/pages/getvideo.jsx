import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const VideoList = (props) => {
    const { darkMode, setProfileSelected } = props;

    const [title, setTitle] = useState(1);

    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();

    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    const fetchVideos = async (pageNum = 1) => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/videos/getvideos?page=${pageNum}&limit=20`
            );
            const data = await res.json();

            if (data.success) {
                // append instead of replace
                setVideos(prev => [...prev, ...data.data.docs]);
                setHasMore(pageNum < data.data.totalPages);
            } else {
                console.error("Backend error:", data.message);
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
        }
    };

    useEffect(() => {
        fetchVideos(page);
    }, [page]);

    // scroll listener
    useEffect(() => {
        function handleScroll() {
            if (
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
                hasMore
            ) {
                setPage(prev => prev + 1);
            }
        }
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, [hasMore]);
    useEffect(() => {
        fetchVideos(title);
    }, [title]);
    function Handle(channel) {
        console.log(channel._id)
        setProfileSelected(channel._id);
        navigate(`/${channel.username}`);
    }
    return (
        <div style={{ padding: "10px" }} className={darkMode ? "bg-neutral-950 text-white min-h-[calc(100vh-80px)]" : ""}>


            <div
                style={{
                    display: "grid",
                    gap: "20px",
                    maxWidth: "1100px",
                    margin: "0 auto",
                    position: "relative",
                }}
                className="video-grid"
            >
                {videos.map((video,idx) => (
                    <div
                        key={`${video._id}-${idx}`}
                        onMouseEnter={() => {
                            timeoutRef.current = setTimeout(() => {
                                setPlayingId(video._id);
                            }, 300);
                        }}
                        onMouseLeave={() => {
                            clearTimeout(timeoutRef.current);
                            setPlayingId(null);
                        }}
                        className={`overflow-hidden shadow-sm mb-4 rounded-[2vh] cursor-pointer transition-transform relative duration-500 ease-in-out ${darkMode ? "bg-black" : ""}`}
                    >
                        {playingId === video._id ? (
                            <video
                                className="rounded-[10px] rounded-b-none"
                                src={video.videoFile}
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    objectFit: "contain",
                                    backgroundColor: "black",
                                    transition: "opacity 0.3s ease",
                                }}
                            />
                        ) : (
                            <img
                                className="hover:scale-[1.02] overflow-hidden transition-transform duration-300 ease-in-out"
                                src={video.thumbnail}
                                alt={video.title}
                                style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                }}
                            />
                        )}

                        <div className="flex flex-start items-center leading-[1.4] h-[80px] mt-1 ml-2">
                            <img
                                onClick={() => { Handle(video.owner.username) }}
                                className="w-9 h-9 hover:ring-1 hover:scale-105 hover:ring-blue-300 shrink-0 transition-transform duration-500 ease-in-out rounded-full object-cover"
                                src={video.owner.avatar}
                                alt="Avatar"
                            />
                            <div
                                onClick={() => { Handle(video.owner) }}
                                className="px-[11px]">
                                <h3
                                    className={`mt-1 text-md leading-[1.4] px-[6px] font-medium capitalize overflow-hidden whitespace-break-spaces ${darkMode ? "text-white" : "text-black"
                                        }`}
                                >
                                    {video.title}
                                </h3>
                                <p

                                    className={`text-sm hover:underline px-[6px] ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {video.owner}
                                </p>
                            </div>
                            <span
                                style={{
                                    position: "absolute",
                                    top: "8px",
                                    right: "8px",
                                    fontWeight: 600,
                                    backgroundColor: "black",
                                    color: "#fff",
                                    padding: "2px 6px",
                                    borderRadius: "4px",
                                    fontSize: "12px",
                                }}
                            >
                                {video.durationFormatted}
                            </span>
                        </div>
                    </div>
                ))}
            </div>
            <LoaderPinwheel className={`mx-auto animate-spin flex justify-center mt-[120px] ${darkMode ? "text-white" : "text-black"} ${videos === null ? "hidden" : "flex"}`} size={40} />
        </div>
    );
};

export default VideoList;