import React from 'react'
import getCurrentUser from '../api/currentuser.jsx';
import axios from "axios";
import { useQuery } from '@tanstack/react-query';
const Createvideo = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser, // You need to implement this function to fetch video by ID
    });
    const currentUserId = data?.user?._id;
    const handleSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append("title", e.target.title.value);
        formData.append("description", e.target.description.value);
        formData.append("videoFile", e.target.videoFile.files[0]);
        formData.append("thumbnail", e.target.thumbnail.files[0]);

        await uploadVideo(formData);
    };
    const uploadVideo = async (formData) => {
        try {
            const response = await axios.post(
                "http://localhost:8000/api/v1/videos/createvideo",
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
            <form
                className="text-xl flex flex-col gap-10 justify-center mt-7"
                onSubmit={handleSubmit}
            >
                <input type="text" name="title" placeholder="Video Title" />
                <input type="file" name="videoFile" />
                <input type="file" name="thumbnail" />
                <input type="text" name="owner" value={currentUserId} readOnly hidden />
                <input type="text" name="description" placeholder="Description" />
                <button type="submit">Submit</button>
            </form>
        </div>
    )
}

export default Createvideo
