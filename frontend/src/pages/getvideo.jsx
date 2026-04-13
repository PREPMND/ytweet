import React, { useEffect, useState } from "react";

const VideoList = () => {
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    const fetchVideos = async (pageNum = 1) => {
        try {
            const res = await fetch(`http://localhost:5000/api/v1/videos?page=${pageNum}&limit=3`);
            const data = await res.json();

            if (data.success) {
                setVideos(data.data.docs);       // paginated docs
                setPage(data.data.page);         // current page
                setTotalPages(data.data.totalPages); // total pages
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

    return (
        <div>
            <h2>Published Videos</h2>
            <ul>
                {videos.map((video) => (
                    <li key={video._id}>
                        <h3>{video.title}</h3>
                        <video width="320" controls>
                            <source src={video.url} type="video/mp4" />
                            Your browser does not support the video tag.
                        </video>
                    </li>
                ))}
            </ul>

            <div style={{ marginTop: "20px" }}>
                <button disabled={page <= 1} onClick={() => fetchVideos(page - 1)}>
                    Previous
                </button>
                <span style={{ margin: "0 10px" }}>
                    Page {page} of {totalPages}
                </span>
                <button disabled={page >= totalPages} onClick={() => fetchVideos(page + 1)}>
                    Next
                </button>
            </div>
        </div>
    );
};

export default VideoList;