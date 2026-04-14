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
    const getVideoDuration = (url) => {
        return new Promise((resolve, reject) => {
            const video = document.createElement("video");
            video.src = url;
            video.preload = "metadata";

            video.onloadedmetadata = () => {
                const seconds = video.duration;
                const hours = Math.floor(seconds / 3600);
                const minutes = Math.floor((seconds % 3600) / 60);
                resolve({ hours, minutes });
            };

            video.onerror = (err) => reject(err);
        });
    };

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
                    //gridTemplateColumns: "repeat(3, 1fr)",
                }}
                className="video-grid"
            >
                {videos.map((video) => (
                    <div
                        onLoad={()=>{
                            getVideoDuration(video.videoFile).then(({ hours, minutes }) => {
                                console.log(`Video Duration: ${hours} hours and ${minutes} minutes`);
                            }).catch((err) => {
                                console.error("Error getting video duration:", err);
                            });
                        }}
                        key={video._id}
                        onClick={() => navigate(`/video/${video._id}`)}
                        onMouseEnter={() => {
                            timeoutRef.current = setTimeout(() => {
                                setPlayingId(video._id);
                            }, 300);
                        }}

                        onMouseLeave={() => {
                            clearTimeout(timeoutRef.current);
                            setPlayingId(null);
                        }}
                        className="overflow-hidden cursor-pointer transition-transform duration-500 ease-in-out"
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
                                    objectFit: "cover",
                                    borderRadius: "10px",
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
                                }}
                            />
                        )}
                        <div><img src={video._id.avatar} alt="Avatar" /></div>
                        <h3
                            className="mt-1 text-md text-black leading-[1.4] px-[6px] font-medium capitalize"

                        >
                            {video.title}
                        </h3>
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