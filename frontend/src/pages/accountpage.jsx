import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import getCurrentUser from "../api/currentuser";

const AccountPage = ({ darkMode }) => {
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const currentUser = await getCurrentUser();
                setUser(currentUser.user);

                const res = await api.post("/videos/any", {
                    owner: currentUser.user._id,
                });

                setVideos(res.data.data || []);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleUpdate = (id) => {
        const proceed = window.confirm(
            "You are about to update this video. Continue?"
        );

        if (proceed) {
            navigate(`/updatevideo/${id}`);
        }
    };

    const handleDelete = async (id) => {
        const proceed = window.confirm(
            "This action cannot be undone. Delete this video?"
        );

        if (!proceed) return;

        try {
            await api.delete(`/videos/deletevideo/${id}`);

            setVideos((prev) =>
                prev.filter((video) => video._id !== id)
            );
        } catch (err) {
            console.log(err);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                Loading...
            </div>
        );
    }

    return (
        <div
            className={`min-h-screen p-5 ${darkMode
                ? "bg-black text-white"
                : "bg-gray-100 text-black"
                }`}
        >

            <div
                className={`max-w-5xl mx-auto rounded-2xl p-6 ${darkMode ? "bg-neutral-900" : "bg-white"
                    }`}
            >
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">

                    <div
                        onClick={() => navigate("/updateuserdetails")}
                        className={`cursor-pointer p-5 font-[Saira] rounded-2xl border transition-all hover:scale-105 ${darkMode
                                ? "bg-zinc-900  border-zinc-700 hover:border-blue-500"
                                : "bg-white border-gray-300 hover:border-blue-500"
                            }`}
                    >
                        <h2 className="text-xl font-[500] mb-2">
                            Profile
                        </h2>
                        <p className="text-sm opacity-70">
                            Update your name and email address.
                        </p>
                    </div>

                    <div
                        onClick={() => navigate("/changepassword")}
                        className={`cursor-pointer p-5 font-[Saira] rounded-2xl border transition-all hover:scale-105 ${darkMode
                                ? "bg-zinc-900 border-zinc-700 hover:border-yellow-500"
                                : "bg-white border-gray-300 hover:border-yellow-500"
                            }`}
                    >
                        <h2 className="text-xl font-[500] mb-2">
                            Password
                        </h2>
                        <p className="text-sm opacity-70">
                            Change account password securely.
                        </p>
                    </div>

                    <div
                        onClick={() => navigate("/updateuserdetails/changeavatar")}
                        className={`cursor-pointer font-[Saira] p-5 rounded-2xl border transition-all hover:scale-105 ${darkMode
                                ? "bg-zinc-900 border-zinc-700 hover:border-green-500"
                                : "bg-white border-gray-300 hover:border-green-500"
                            }`}
                    >
                        <h2 className="text-xl font-[500] mb-2">
                            Avatar
                        </h2>
                        <p className="text-sm opacity-70">
                            Upload a new profile picture.
                        </p>
                    </div>

                    <div
                        onClick={() => navigate("/updateuserdetails/coverimage")}
                        className={`cursor-pointer font-[Saira] p-5 rounded-2xl border transition-all hover:scale-105 ${darkMode
                                ? "bg-zinc-900 border-zinc-700 hover:border-purple-500"
                                : "bg-white border-gray-300 hover:border-purple-500"
                            }`}
                    >
                        <h2 className="text-xl font-[500] mb-2">
                            Cover Image
                        </h2>
                        <p className="text-sm opacity-70">
                            Customize your channel banner.
                        </p>
                    </div>

                </div>
                <div className="flex items-center gap-5 mb-8">
                    <img
                        src={user?.avatar}
                        alt="avatar"
                        className="w-20 h-20 rounded-full object-cover"
                    />

                    <div>
                        <h1 className="text-2xl font-bold">
                            {user?.username}
                        </h1>

                        <p className="opacity-70">
                            {user?.email}
                        </p>
                    </div>
                </div>

                <h2 className="text-2xl font-[Saira] font-bold mb-6">
                    Your Videos
                </h2>

                <div className="grid gap-5">
                    {videos.length === 0 ? (
                        <p>No videos uploaded.</p>
                    ) : (
                        videos.map((video) => (
                            <div
                                key={video._id}
                                className={`rounded-xl overflow-hidden border ${darkMode
                                    ? "border-zinc-700"
                                    : "border-gray-300"
                                    }`}
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className="w-full h-56 object-cover"
                                />

                                <div className="p-4 font-[500]">
                                    <h3 className="text-xl font-[Saira] ">
                                        {video.title}
                                    </h3>

                                    <p className="opacity-70 font-[400] mt-2">
                                        {video.description}
                                    </p>

                                    <p className="mt-2 text-sm  opacity-60">
                                        {video.views} views
                                    </p>

                                    <div className="flex gap-3 font-[Saira] mt-5">
                                        <button
                                            onClick={() =>
                                                handleUpdate(video._id)
                                            }
                                            className="px-4 hover:scale-[1.02] py-2 rounded-lg bg-blue-600 text-white"
                                        >
                                            Update
                                        </button>

                                        <button
                                            onClick={() =>
                                                handleDelete(video._id, video.title)
                                            }
                                            className="px-4 py-2 rounded-lg bg-red-600 text-white"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};


export default AccountPage;