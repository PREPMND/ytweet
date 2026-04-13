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
                    <li key={video._id} style={{ marginBottom: "30px" }}>
                        <h3>{video.title}</h3>

                        {/* Thumbnail stacked above */}
                        <img
                        className="object-cover"
                            src={video.thumbnail}
                            alt={video.title}
                            width="320"
                            height="180"
                            style={{ display: "block", marginBottom: "10px", borderRadius: "8px" }}
                        />

                        {/* Video player */}
                        <video
                            width="320"
                            height="180"
                            poster={video.thumbnail}   // 👈 shows thumbnail as preview
                            controls
                            style={{ borderRadius: "8px" }}
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