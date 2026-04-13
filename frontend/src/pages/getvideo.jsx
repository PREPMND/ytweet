import React from 'react'
import getCurrentUser from '../api/currentuser';
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
const createVideo = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser, // You need to implement this function to fetch video by ID
    });
    const currentUserId = data?.user?._id;
    
    const uploadVideo = async () => {
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
            <button onClick={uploadVideo}>Create Video</button>
            <form>
                <input type="text" name="title" placeholder="Video Title" />
                <input type="text" name="videoFile" placeholder="Video File URL" />
                <input type="text" name="thumbnail" placeholder="Thumbnail URL" />
                <input type="number" name="duration" placeholder="Duration in seconds" />
                <input type="hidden" name="owner" value={currentUserId} />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default createVideo
