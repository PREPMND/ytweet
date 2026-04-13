import React from 'react'
import getCurrentUser from '../api/currentuser';
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
const Createvideo = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser, // You need to implement this function to fetch video by ID
    });
    const currentUserId = data?.user?._id;
    
    const uploadVideo = async (formData) => {
        try {
            const response = await axios.post(
                "/api/videos/createvideo",
                formData,
                {
                    withCredentials: true, // send cookies for verifyJWT
                    headers: {
                        "Content-Type": "multipart/form-data",
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
            <form className='text-xl flex flex-col gap-10 justify-center mt-7'>
                <input type="text" name="title" placeholder="Video Title" />
                <input type="file" name="videoFile" placeholder="Video File" />
                <input type="file" name="thumbnail" placeholder="Thumbnail" />
                <input type="text" name="description" placeholder="Description" />
                <input type="hidden" name="owner" value={currentUserId} />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Createvideo
