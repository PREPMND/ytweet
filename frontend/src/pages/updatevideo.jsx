import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/api";

export default function UpdateVideo({ darkMode }) {
    const { id } = useParams();
    const navigate = useNavigate();

    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [thumbnail, setThumbnail] = useState("");
    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);
    const [rateLimitMessage, setRateLimitMessage] = useState(false);
    useEffect(() => {
        const fetchVideo = async () => {
            try {
                const res = await api.get(`/videos/getvideo/${id}`);

                setTitle(res.data.data.title);
                setDescription(res.data.data.description);
                setThumbnail(res.data.data.thumbnail);
            } catch (err) {
                console.log(err);
            } finally {
                setLoading(false);
            }
        };

        fetchVideo();
    }, [id]);

    const handleUpdate = async (e) => {
        e.preventDefault();

        try {
            setUpdating(true);

            await api.put(`/videos/updatevideo/${id}`, {
                title,
                description,
            });

            navigate(`/watchvideo/${id}`);
        } catch (err) {

            if (err.response?.status === 429) {
                setRateLimitMessage(true);

                clearTimeout(window.rateLimitTimer);

                window.rateLimitTimer = setTimeout(() => {
                    setRateLimitMessage(false);
                }, 2000);

                return;
            }
            console.log(err);
        } finally {
            setUpdating(false);
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
            className={`min-h-screen flex justify-center items-center p-4 ${darkMode ? "bg-black text-white" : "bg-gray-100 text-black"
                }`}
        >
            <form
                onSubmit={handleUpdate}
                className={`w-full max-w-2xl rounded-2xl p-6 shadow-lg ${darkMode ? "bg-zinc-900" : "bg-white"
                    }`}
            >
                <h1 className="text-3xl font-bold mb-6">Update Video</h1>

                <img
                    src={thumbnail}
                    alt="thumbnail"
                    className="w-full h-64 object-cover rounded-xl mb-6"
                />

                <div className="mb-4">
                    <label className="block mb-2 font-semibold">
                        Video Title
                    </label>

                    <input
                        type="text"
                        value={title}
                        onChange={(e) => setTitle(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode
                            ? "bg-zinc-800 border-zinc-700"
                            : "bg-white border-gray-300"
                            }`}
                    />
                </div>

                <div className="mb-6">
                    <label className="block mb-2 font-semibold">
                        Description
                    </label>

                    <textarea
                        rows={6}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className={`w-full p-3 rounded-lg border ${darkMode
                            ? "bg-zinc-800 border-zinc-700"
                            : "bg-white border-gray-300"
                            }`}
                    />
                </div>

                <div className="flex gap-3">
                    <button
                        type="submit"
                        disabled={updating}
                        className="px-6 py-3 bg-blue-600 text-white rounded-lg"
                    >
                        {updating ? "Updating..." : "Update Video"}
                    </button>

                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className="px-6 py-3 bg-gray-500 text-white rounded-lg"
                    >
                        Cancel
                    </button>
                </div>
            </form>
            <div>
                {rateLimitMessage && (
                    <div
                        className="text-[14px] font-[Saira] md:text-[17px] fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900
    text-white  px-5 max-w-[50%] py-3 rounded-xl shadow-2xl border border-neutral-700 z-[9999] animate-toast">
                        You're requesting too quickly.
                    </div>
                )}
            </div >
        </div>
    );
}