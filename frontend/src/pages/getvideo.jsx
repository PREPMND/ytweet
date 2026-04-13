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
        <div>
            <h2>Published Videos</h2>
            <ul style={{ listStyle: "none", padding: 0 }}>
                {videos.map((video) => (
                    <li
                        key={video._id}
                        style={{
                            marginBottom: "30px",
                            width: "320px" // fixed width for consistency
                        }}
                    >
                        <h3 style={{ marginBottom: "10px" }}>{video.title}</h3>

                        {/* Thumbnail stacked above */}
                        <div
                            style={{
                                width: "320px",
                                height: "180px", // fixed height for consistent aspect ratio
                                overflow: "hidden",
                                borderRadius: "8px",
                                marginBottom: "10px"
                            }}
                        >
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                style={{
                                    width: "100%",
                                    height: "100%",
                                    objectFit: "cover" // ensures image fills box without distortion
                                }}
                            />
                        </div>

                        {/* Video player with poster thumbnail */}
                        <video
                            width="320"
                            height="180"
                            controls
                            poster={video.thumbnail}
                            style={{
                                borderRadius: "8px",
                                backgroundColor: "#000",
                                objectFit: "cover"
                            }}
                        >
                            <source src={video.videoFile} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "20px" }}>
                <button disabled={title <= 1} onClick={() => fetchVideos(title - 1)}>
                    Previous
                </button>
                <span style={{ margin: "0 10px" }}>
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