import React from 'react'
import getCurrentUser from './currentuser';

const getVideo = () => {
    const { data, error, isLoading } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser, // You need to implement this function to fetch video by ID
    });
    const currentUserId = data?.user?._id;
    import axios from "axios";

    const createVideo = async () => {
        try {
            const response = await axios.post(
                "/api/videos",
                {
                    videoFile: "path_or_url_to_video.mp4",
                    thumbnail: "path_or_url_to_thumbnail.jpg",
                    title: "My First Video",
                    duration: 120, // duration in seconds
                },
                {
                    withCredentials: true, // <-- critical for sending cookies
                    headers: {
                        "Content-Type": "application/json",
                    },
                }
            );

            console.log("Video created:", response.data);
        } catch (error) {
            console.error("Error creating video:", error.response?.data || error.message);
        }
    };
    
    return (
        <div>
            <button onClick={createVideo}>Create Video</button>
            <form>
                <input type="text" placeholder="Video Title" />
                <input type="text" placeholder="Video URL" />
                <input type="text" placeholder="Thumbnail URL" />
                <input type="number" placeholder="Duration (seconds)" />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default getVideo
