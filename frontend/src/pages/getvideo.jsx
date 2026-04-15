import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

const VideoList = (props) => {
    const {darkMode, setDarkMode} = props;

    const [videos, setVideos] = useState([]);
    const [data, setData] = useState(false);
    const [title, setTitle] = useState(1);
    const [thumbnail, setThumbnail] = useState(1);

    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();

    const fetchVideos = async (pageNum = 1) => {
        try {
            setTimeout(() => {
                setData(false);
            }, 5000);
            const res = await fetch(`${import.meta.env.VITE_BACKEND}/api/v1/videos/getvideos`);
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.docs);
                setData(true);
            } else {
                console.error("Backend error:", data.message);
            }
        } catch (err) {
            console.error("Error fetching videos:", err);
        }
    };

    useEffect(() => {
        fetchVideos(title);
    }, [title]);

    return (
        <div style={{ padding: "10px" }} className={darkMode ? "bg-neutral-950 text-white min-h-[calc(100vh-80px)]" : ""}>
            <h2 style={{ marginBottom: "20px" }}>Published Videos</h2>

            <button
                onClick={() => setDarkMode(!darkMode)}
                style={{ marginBottom: "10px" }}
                className="px-3 py-1 bg-neutral-900 text-white rounded"
            >
                Toggle Mode
            </button>

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
                {videos.map((video) => (
                    <div
                        key={video._id}
                        onClick={() => navigate(`/video/${video._id}`)}
                        onMouseEnter={() => {
                            timeoutRef.current = setTimeout(() => {
                                setPlayingId(video._id);
                            }, 1300);
                        }}
                        onMouseLeave={() => {
                            clearTimeout(timeoutRef.current);
                            setPlayingId(null);
                        }}
                        className={`overflow-hidden shadow-sm mb-4 rounded-[2vh] cursor-pointer transition-transform relative duration-500 ease-in-out ${darkMode ? "bg-black" : ""}`}
                    >
                        {playingId === video._id ? (
                            <video
                                src={video.videoFile}
                                autoPlay
                                muted
                                loop
                                playsInline
                                style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    objectFit: "contain",
                                    borderRadius: "10px",
                                    backgroundColor: "black",
                                    transition: "opacity 0.3s ease",
                                }}
                            />
                        ) : (
                            <img
                            className="hover:scale-[1.03] rounded-b-none overflow-hidden transition-transform duration-300 ease-in-out"
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
                                className="w-9 h-9 hover:ring-1 hover:scale-105 hover:ring-blue-300 shrink-0 transition-transform duration-500 ease-in-out rounded-full object-cover"
                                src={video.owner.avatar}
                                alt="Avatar"
                            />
                            <div className="px-[11px]">
                                <h3
                                    className={`mt-1 text-md leading-[1.4] px-[6px] font-medium capitalize overflow-hidden whitespace-wrap ${
                                        darkMode ? "text-white" : "text-black"
                                    }`}
                                >
                                    {video.title}
                                </h3>
                                <p className={`text-sm hover:underline px-[6px] ${darkMode ? "text-gray-400" : "text-gray-600"}`}>
                                    {video.owner.username}
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
            <LoaderPinwheel className={`mx-auto animate-spin flex place-items-center mt-20 ${darkMode ? "text-white" : "text-black"} ${videos===null? "hidden" : ""}`} size={40} />
        </div>
    );
};

export default VideoList;