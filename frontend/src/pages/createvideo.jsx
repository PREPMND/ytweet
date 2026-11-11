import React, { useState, useEffect } from "react";
import getCurrentUser from "../api/currentuser.jsx";
import api from "../api/api.jsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { LoaderPinwheel } from "lucide-react";
import { toast } from "../components/toast.jsx";

const Createvideo = ({ darkMode }) => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const [loading, setLoading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [step, setStep] = useState(1);
    const [videoFile, setVideoFile] = useState(null);
    const [thumbnail, setThumbnail] = useState(null);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");

    // Object URLs are kept in state rather than created inline during render.
    // `URL.createObjectURL(file)` in JSX makes a NEW blob URL on every render
    // and never revokes any of them -- a steady memory leak while typing in
    // the title field, because each keystroke re-renders this component.
    const [videoPreview, setVideoPreview] = useState(null);
    const [thumbPreview, setThumbPreview] = useState(null);

    useEffect(() => {
        if (!videoFile) return setVideoPreview(null);
        const url = URL.createObjectURL(videoFile);
        setVideoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [videoFile]);

    useEffect(() => {
        if (!thumbnail) return setThumbPreview(null);
        const url = URL.createObjectURL(thumbnail);
        setThumbPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [thumbnail]);

    const uploadVideo = async () => {
        if (!title.trim()) return toast("Give the video a title", { type: "error" });
        if (!description.trim()) return toast("Add a description", { type: "error" });

        const formData = new FormData();
        formData.append("title", title);
        formData.append("description", description);
        formData.append("videoFile", videoFile);
        formData.append("thumbnail", thumbnail);

        setLoading(true);
        setProgress(0);

        try {
            // Use the shared `api` instance, not a bare axios call: it carries
            // the baseURL, withCredentials, and the 401-refresh interceptor.
            // A raw axios.post here meant an expired access token failed the
            // upload outright instead of refreshing and retrying.
            const response = await api.post("/videos/createvideo", formData, {
                headers: { "Content-Type": "multipart/form-data" },
                onUploadProgress: (e) => {
                    if (e.total) setProgress(Math.round((e.loaded * 100) / e.total));
                },
            });

            if (response.data.success) {
                toast("Video published");
                // The feed is cached server-side AND client-side; drop the
                // client copy so the new video shows up immediately.
                queryClient.invalidateQueries({ queryKey: ["videos"] });
                navigate("/");
            }
        } catch (error) {
            // The original logged to the console and left the user staring at
            // a spinner with no idea anything had failed.
            toast(
                error.response?.data?.message || "Upload failed. Please try again.",
                { type: "error" }
            );
        } finally {
            setLoading(false);
        }
    };

    /* ---------------------------------------------------------------- */
    /* Theme-aware classes.                                             */
    /* The page previously hardcoded `text-neutral-800` on a container   */
    /* that sits on a black background in dark mode, so every heading    */
    /* was dark grey on black. The buttons had no text colour at all, so */
    /* they inherited it too -- dark red text on a red button.           */
    /* ---------------------------------------------------------------- */
    const card = darkMode
        ? "bg-neutral-900 border border-neutral-800 text-neutral-100"
        : "bg-white border border-neutral-200 text-neutral-900";

    const field = darkMode
        ? "bg-neutral-800 text-white placeholder:text-neutral-500 border border-neutral-700"
        : "bg-neutral-50 text-neutral-900 placeholder:text-neutral-400 border border-neutral-300";

    const primary =
        "bg-red-600 text-white hover:bg-red-500 disabled:opacity-40 disabled:cursor-not-allowed";

    const secondary = darkMode
        ? "border border-neutral-700 text-neutral-200 hover:bg-neutral-800"
        : "border border-neutral-300 text-neutral-700 hover:bg-neutral-100";

    // `no-global-file-style` opts out of the global input[type=file] rule in
    // index.css, so these inputs keep their own Tailwind `file:` styling.
    const fileInput = `no-global-file-style w-full rounded-lg p-3 text-sm
        file:mr-3 file:rounded-lg file:border-0 file:bg-red-600 file:px-4 file:py-2
        file:text-white file:cursor-pointer hover:file:bg-red-500 ${field}`;

    return (
        <div className={`min-h-screen px-4 pb-24 pt-10 ${darkMode ? "bg-black" : "bg-neutral-50"}`}>
            <div className={`mx-auto max-w-2xl rounded-2xl p-8 shadow-lg *:select-none ${card}`}>

                {/* Step indicator -- the original gave no sense of progress. */}
                <div className="mb-8 flex items-center gap-2">
                    {[1, 2, 3].map((n) => (
                        <div key={n} className="flex flex-1 items-center gap-2">
                            <span
                                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[13px] font-semibold
                                    ${step >= n
                                        ? "bg-red-600 text-white"
                                        : darkMode ? "bg-neutral-800 text-neutral-500" : "bg-neutral-200 text-neutral-500"}`}
                            >
                                {n}
                            </span>
                            {n < 3 && (
                                <div className={`h-0.5 flex-1 rounded ${step > n ? "bg-red-600" : darkMode ? "bg-neutral-800" : "bg-neutral-200"}`} />
                            )}
                        </div>
                    ))}
                </div>

                {step === 1 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-semibold tracking-tight">Upload Video</h2>

                        <input
                            type="file"
                            accept="video/*"
                            onChange={(e) => setVideoFile(e.target.files[0])}
                            className={fileInput}
                        />
                        {videoFile && (
                            <p className={`-mt-4 text-[13px] ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                                {videoFile.name} · {(videoFile.size / 1024 / 1024).toFixed(1)} MB
                            </p>
                        )}

                        <h2 className="text-2xl font-semibold tracking-tight">Upload Thumbnail</h2>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setThumbnail(e.target.files[0])}
                            className={fileInput}
                        />
                        {thumbnail && (
                            <p className={`-mt-4 text-[13px] ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                                {thumbnail.name}
                            </p>
                        )}

                        <button
                            disabled={!videoFile || !thumbnail}
                            onClick={() => setStep(2)}
                            className={`rounded-lg py-3 font-medium transition ${primary}`}
                        >
                            Next
                        </button>

                        {(!videoFile || !thumbnail) && (
                            <p className={`-mt-3 text-center text-[13px] ${darkMode ? "text-neutral-500" : "text-neutral-400"}`}>
                                Both a video and a thumbnail are required.
                            </p>
                        )}
                    </div>
                )}

                {step === 2 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-semibold tracking-tight">Preview &amp; Details</h2>

                        {videoPreview && (
                            <video
                                src={videoPreview}
                                controls
                                className="aspect-[16/9] w-full rounded-xl bg-black object-contain"
                            />
                        )}

                        {thumbPreview && (
                            <img src={thumbPreview} alt="Selected thumbnail" className="w-full rounded-xl" />
                        )}

                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            maxLength={120}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`rounded-lg p-3 text-[16px] outline-none focus:ring-2 focus:ring-red-500 ${field}`}
                        />

                        <textarea
                            placeholder="Description"
                            value={description}
                            rows={4}
                            onChange={(e) => setDescription(e.target.value)}
                            className={`rounded-lg p-3 outline-none focus:ring-2 focus:ring-red-500 ${field}`}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep(1)}
                                className={`flex-1 rounded-lg py-3 font-medium transition ${secondary}`}
                            >
                                Back
                            </button>
                            <button
                                disabled={!title.trim() || !description.trim()}
                                onClick={() => setStep(3)}
                                className={`flex-1 rounded-lg py-3 font-medium transition ${primary}`}
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="flex flex-col gap-6">
                        <h2 className="text-2xl font-semibold tracking-tight">Ready to Upload</h2>

                        <div className={`rounded-xl p-4 ${darkMode ? "bg-neutral-800" : "bg-neutral-100"}`}>
                            <p className="font-medium">{title}</p>
                            <p className={`mt-1 text-[13px] ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                                {description}
                            </p>
                        </div>

                        {loading && (
                            <div>
                                <div className={`h-2 w-full overflow-hidden rounded-full ${darkMode ? "bg-neutral-800" : "bg-neutral-200"}`}>
                                    <div
                                        className="h-full rounded-full bg-red-600 transition-[width] duration-200"
                                        style={{ width: `${progress}%` }}
                                    />
                                </div>
                                <p className={`mt-2 text-center text-[13px] ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                                    {progress < 100 ? `Uploading ${progress}%` : "Processing on the server..."}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={uploadVideo}
                            disabled={loading}
                            className={`rounded-lg py-3 font-medium transition ${primary}`}
                        >
                            {loading ? "Uploading..." : "Submit"}
                        </button>

                        <button
                            onClick={() => setStep(2)}
                            disabled={loading}
                            className={`rounded-lg py-3 font-medium transition ${secondary}`}
                        >
                            Back
                        </button>
                    </div>
                )}

                <LoaderPinwheel
                    className={`${loading ? "block" : "hidden"} absolute left-1/2 top-10 z-40 animate-spin text-red-500`}
                    size={28}
                />
            </div>
        </div>
    );
};

export default Createvideo;
