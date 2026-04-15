import React, { useState } from "react";
import getCurrentUser from "../api/currentuser.jsx";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoaderPinwheel } from "lucide-react";
const Createvideo = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const navigate = useNavigate();
    const currentUserId = data?.user?._id;
    const [loading, setLoading] = useState(false);
    const [step, setStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    const uploadVideo = async () => {
        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("videoFile", videoFile);
        formData.append("thumbnail", thumbnail);
        formData.append("owner", currentUserId);
        setLoading(true);
        try {
            const response = await axios.post(
                `${import.meta.env.BACKEND}/api/v1/videos/createvideo`,
                formData,
                {
                    withCredentials: true,
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                }
            );

            console.log("Video created:", response.data);

            if (response.data.success) { 
                setTimeout(() => {
                    setLoading(false);
                    navigate("/");
                }, 3000);
             }
        } catch (error) {
            setLoading(false);
            console.error(
                "Error creating video:",
                error.response?.data || error.message
            );
        }
    };

    return (
        <div className="max-w-2xl mx-auto mt-12 p-8 bg-white/20 rounded-2xl text-neutral-800 shadow-lg">
            {step === 1 && (
                <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold">Upload Video</h2>

                    <input
                        type="file"
                        accept="video/*"
                        onChange={(e) => setVideoFile(e.target.files[0])}
                        className="file:bg-red-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg bg-zinc-800 p-2 rounded-lg"
                    />
                    <h2 className="text-2xl font-semibold">Upload Thumbnail</h2>
                    <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setThumbnail(e.target.files[0])}
                        className="file:bg-red-600 file:text-white file:border-0 file:px-4 file:py-2 file:rounded-lg bg-zinc-800 p-2 rounded-lg"
                    />

                    <button
                        disabled={!videoFile || !thumbnail}
                        onClick={() => setStep(2)}
                        className="bg-red-600 hover:bg-red-700 transition disabled:opacity-50 py-3 rounded-lg"
                    >
                        Next
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold">Preview & Details</h2>

                    <video
                        src={videoFile ? URL.createObjectURL(videoFile) : ""}
                        controls
                        className="w-full rounded-xl aspect-[16/9] object-contain"
                    />

                    <img
                        src={thumbnail ? URL.createObjectURL(thumbnail) : ""}
                        alt=""
                        className="w-full rounded-xl"
                    />

                    <input
                        type="text"
                        placeholder="Title"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className="bg-zinc-800 text-white p-3 font-[400] rounded-lg text-[16px]rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <textarea
                        placeholder="Description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-zinc-800 text-white p-3 font-[400] rounded-lg outline-none focus:ring-2 focus:ring-red-500"
                    />

                    <div className="flex gap-3">
                        <button
                            onClick={() => setStep(1)}
                            className="flex-1 border border-zinc-700 py-3 rounded-lg"
                        >
                            Back
                        </button>

                        <button
                            onClick={() => setStep(3)}
                            className="flex-1 bg-red-600 hover:bg-red-700 transition py-3 rounded-lg"
                        >
                            Next
                        </button>
                    </div>
                </div>
            )}

            {step === 3 && (
                <div className="flex flex-col gap-6">
                    <h2 className="text-2xl font-semibold">Ready to Upload</h2>

                    <p className="text-zinc-400">{title}</p>

                    <button
                        onClick={uploadVideo}
                        className="bg-red-600 hover:bg-red-700 transition py-3 rounded-lg"
                    >
                        Submit
                    </button>

                    <button
                        onClick={() => setStep(2)}
                        className="border border-zinc-700 py-3 rounded-lg"
                    >
                        Back
                    </button>
                </div>
            )}
            <LoaderPinwheel className={`${loading?"block":"hidden"} z-40 absolute left-1/2 top-10 animate-spin text-neutral-950`} size={28} />
        </div>
    );
};

export default Createvideo;