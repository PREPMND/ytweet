import React, { useEffect, useState,useRef } from "react";
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
                setTitle(data.data.docs.title);         // current title
                setThumbnail(data.data.docs.thumbnail);
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
                                
                        className="overflow-hidden cursor-pointer transition-transform duration-500 ease-in-out"
                            />
                        )}

                        <h3
                            style={{
                                marginTop: "8px",
                                fontSize: "14px",
                                color: "black",
                                lineHeight: "1.4",
                                padding: "0 6px",
                                fontWeight: "500",
                            }}
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