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

            {/* GRID */}
            <div
                style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", // 👈 smaller width
                    gap: "20px",
                    maxWidth: "900px", // 👈 keeps layout tighter
                    margin: "0 auto",
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
                        {/* THUMBNAIL OR VIDEO */}
                        {playingId !== video._id ? (
                            <div
                                onClick={() => setPlayingId(video._id)}
                                style={{
                                    position: "relative",
                                    cursor: "pointer",
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
                                        borderRadius: "8px",
                                    }}
                                />

                                {/* Custom Play Button */}
                                <div
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        background: "rgba(0,0,0,0.6)",
                                        borderRadius: "50%",
                                        padding: "12px 16px",
                                        color: "#fff",
                                        fontSize: "18px",
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
                                    borderRadius: "8px",
                                    backgroundColor: "#000",
                                }}
                            >
                                <source src={video.videoFile} type="video/mp4" />
                            </video>
                        )}

                        {/* TITLE */}
                        <h3
                            style={{
                                marginTop: "10px",
                                fontSize: "15px",
                                color: "#fff",
                            }}
                        >
                            {video.title}
                        </h3>
                    </div>
                ))}
            </div>

            {/* PAGINATION */}
            <div
                style={{
                    marginTop: "30px",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    gap: "10px",
                }}
            >
                <button
                    disabled={page <= 1}
                    onClick={() => fetchVideos(page - 1)}
                >
                    Previous
                </button>

                <span>
                    Page {page} of {totalPages}
                </span>

                <button
                    disabled={page >= totalPages}
                    onClick={() => fetchVideos(page + 1)}
                >
                    Next
                </button>
            </div>
        </div>
    );
};

export default VideoList;