import React, { useEffect, useState } from "react";

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [title, setTitle] = useState(1);
    const [thumbnail, setThumbnail] = useState(1);
    const [playingId, setPlayingId] = useState(null);
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
        <div style={{ padding: "20px" }}>
            <h2 style={{ marginBottom: "20px" }}>Published Videos</h2>

            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                    maxWidth: "700px",
                    gap: "20px",
                }}
            >
                {videos.map((video) => (
                    <div
                        key={video._id}
                        style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            background: "#0f0f0f",
                            padding: "8px",
                            transition: "0.3s",
                            cursor: "pointer",
                        }}
                    >
                        {playingId !== video._id ? (
                            <div
                                onClick={() => setPlayingId(video._id)}
                                style={{
                                    position: "relative",
                                }}
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    loading="lazy"
                                    style={{
                                        width: "100%",
                                        aspectRatio: "16 / 9",
                                        objectFit: "cover",
                                        borderRadius: "10px",
                                    }}
                                />

                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(0,0,0,0.65)",
                                        borderRadius: "50%",
                                        padding: "10px 14px",
                                        color: "#fff",
                                        fontSize: "16px",
                                    }}
                                >
                                    ▶
                                </div>
                            </div>
                        ) : (
                            <video
                                controls
                                autoPlay
                                style={{
                                    width: "100%",
                                    aspectRatio: "16 / 9",
                                    borderRadius: "10px",
                                    backgroundColor: "#000",
                                }}
                            >
                                <source src={video.videoFile} type="video/mp4" />
                            </video>
                        )}

                        <h3
                            style={{
                                marginTop: "8px",
                                fontSize: "14px",
                                color: "#e5e5e5",
                                lineHeight: "1.4",
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