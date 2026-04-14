import React, { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [title, setTitle] = useState(1);
    const [thumbnail, setThumbnail] = useState(1);
    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    const navigate = useNavigate();
    const fetchVideos = async (pageNum = 1) => {
        try {
            const res = await fetch(`http://localhost:8000/api/v1/videos/getvideos`);
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.docs);       // paginated docs
                console.log("Total Pages:", data.data.docs); // total pages
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

    // Usage

    return (
        <div style={{ padding: "10px" }}>
            <h2 style={{ marginBottom: "20px" }}>Published Videos</h2>

            <div
                style={{
                    display: "grid",
                    gap: "20px",
                    maxWidth: "1100px",
                    margin: "0 auto",
                    position: "relative",
                    //gridTemplateColumns: "repeat(3, 1fr)",
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
                            }, 2000);
                        }}

                        onMouseLeave={() => {
                            clearTimeout(timeoutRef.current);
                            setPlayingId(null);
                        }}
                        className="overflow-hidden shadow-sm rounded-[2vh] cursor-pointer transition-transform relative duration-500 ease-in-out"
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
                                src={video.thumbnail}
                                alt={video.title}
                                style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    objectFit: "cover",
                                    borderRadius: "10px",
                                    transition: "opacity 0.3s ease",
                                }}
                            />

                        )}
                        

                        <div
                            className="flex flex-start items-center leading-[1.4] h-[80px] mt-1 ml-2"><img className="w-9 h-9 shrink-0 rounded-full object-cover" src={video.owner.avatar} alt="Avatar" />
                            <div className="px-[11px]">
                                <h3
                                    className="mt-1 text-md text-black leading-[1.4] px-[6px] font-medium capitalize text-wrap overflow-hidden whitespace-nowrap"

                                >
                                    {video.title}
                                </h3>
                                <p className="text-sm text-gray-600 px-[6px]">{video.owner.username}</p>
                            </div>
                            <span
                            style={{
                                position: "absolute",
                                top: "8px",
                                right: "8px",
                                fontWeight: 600,
                                backgroundColor: "black ",
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

            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "center",
                    gap: "10px",
                }}
            >
                <button disabled={title <= 1} onClick={() => fetchVideos(title - 1)}>
                    Previous
                </button>

                <span>
                    Page {title} of {thumbnail}
                </span>

                <button disabled={title >= thumbnail} onClick={() => fetchVideos(title + 1)}>
                    Next
                </button>
            </div>
            
        </div>
        
    );
};

export default VideoList;