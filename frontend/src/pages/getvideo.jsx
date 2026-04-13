import React, { useEffect, useState } from "react";

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [title, setTitle] = useState(1);
    const [thumbnail, setThumbnail] = useState(1);

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
                    gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                    gap: "20px",
                }}
            >
                {videos.map((video) => (
                    <div
                        key={video._id}
                        style={{
                            borderRadius: "10px",
                            overflow: "hidden",
                            background: "#111",
                            padding: "10px",
                        }}
                    >
                        <video
                            controls
                            poster={video.thumbnail}
                            style={{
                                width: "100%",
                                aspectRatio: "16 / 9", 
                                borderRadius: "8px",
                                backgroundColor: "#000",
                                objectFit: "cover",
                            }}
                        >
                            <source src={video.videoFile} type="video/mp4" />
                        </video>

                        {/* Title below */}
                        <h3
                            style={{
                                fontSize: "16px",
                                marginTop: "10px",
                                color: "#fff",
                            }}
                        >
                            {video.title}
                        </h3>
                    </div>
                ))}
            </div>

            {/* Pagination */}
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