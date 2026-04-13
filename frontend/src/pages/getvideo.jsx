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
                    gap: "20px",
                    maxWidth: "1000px",
                    margin: "0 auto",
                    //gridTemplateColumns: "repeat(3, 1fr)",
                }}
                className="video-grid"
            >
                {videos.map((video) => (
                    <div
                        key={video._id}
                        onClick={() => navigate(`/video/${video._id}`)}
                        style={{
                            borderRadius: "12px",
                            overflow: "hidden",
                            background: "#0f0f0f",
                            padding: "8px",
                            cursor: "pointer",
                        }}
                    >
                        <video
                            src={video.videoFile}
                            poster={video.thumbnail}
                            muted
                            loop
                            playsInline
                            style={{
                                width: "100%",
                                aspectRatio: "16 / 9",
                                objectFit: "cover",
                                borderRadius: "10px",
                            }}
                            onMouseEnter={(e) => {
                                e.target.play();
                            }}
                            onMouseLeave={(e) => {
                                e.target.pause();
                                e.target.currentTime = 0;
                            }}
                        />

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