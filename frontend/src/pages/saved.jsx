import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Clock, Trash2 } from "lucide-react";

import { getWatchLater, toggleWatchLater } from "../api/library";
import { BlockLoader, Skeleton } from "../components/loader";
import { toast } from "../components/toast";
import { formatViews, timeAgo } from "../utils/format";

function formatDuration(seconds = 0) {
    const total = Math.max(0, Math.floor(Number(seconds) || 0));
    const m = Math.floor(total / 60);
    const s = total % 60;
    return total < 60 ? `${s}s` : `${m}m ${String(s).padStart(2, "0")}s`;
}

export default function SavedPage({ darkMode }) {
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    const { data: videos, isLoading, isError, error } = useQuery({
        queryKey: ["watchLater"],
        queryFn: getWatchLater,
        retry: false,
    });

    const remove = useMutation({
        mutationFn: toggleWatchLater,
        onSuccess: () => {
            toast("Removed from Saved");
            // Both the list and the id-set the feed menu reads must be
            // refreshed, or the feed would still show "Remove from Watch later".
            queryClient.invalidateQueries({ queryKey: ["watchLater"] });
            queryClient.invalidateQueries({ queryKey: ["library"] });
        },
        onError: () => toast("Could not remove", { type: "error" }),
    });

    const shell = darkMode ? "bg-black text-white" : "bg-white text-neutral-900";
    const row = darkMode
        ? "border-neutral-800 hover:bg-neutral-900"
        : "border-neutral-200 hover:bg-neutral-50";

    if (isError && error?.response?.status === 401) {
        return (
            <div className={`flex min-h-[70vh] flex-col items-center justify-center gap-4 ${shell}`}>
                <Clock size={40} className="text-blue-500" />
                <p className="text-lg font-medium">Log in to see your saved videos</p>
                <button
                    onClick={() => navigate("/login")}
                    className="rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
                >
                    Log in
                </button>
            </div>
        );
    }

    return (
        <div className={`min-h-screen px-4 pb-28 pt-6 ${shell}`}>
            <div className="mx-auto w-full max-w-3xl">
                <div className="mb-6 flex items-center gap-3">
                    <Clock size={22} className="text-blue-500" />
                    <h1 className="text-2xl font-semibold tracking-tight">Saved</h1>
                    {videos?.length > 0 && (
                        <span className={`text-sm ${darkMode ? "text-neutral-500" : "text-neutral-400"}`}>
                            {videos.length}
                        </span>
                    )}
                </div>

                {isLoading && (
                    <div className="flex flex-col gap-3">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex gap-4 rounded-xl p-3">
                                <Skeleton className="h-[90px] w-40 shrink-0 rounded-lg" />
                                <div className="flex-1 space-y-2 pt-2">
                                    <Skeleton className="h-3 w-3/4 rounded" />
                                    <Skeleton className="h-3 w-1/3 rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {isError && error?.response?.status !== 401 && (
                    <p className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-400">
                        Couldn’t load your saved videos.
                    </p>
                )}

                {!isLoading && !isError && videos?.length === 0 && (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                        <Clock size={36} className={darkMode ? "text-neutral-700" : "text-neutral-300"} />
                        <p className={`text-sm ${darkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                            Nothing saved yet. Use the ⋮ menu on any video and pick “Watch later”.
                        </p>
                        <button
                            onClick={() => navigate("/")}
                            className="mt-2 rounded-lg bg-blue-600 px-5 py-2 text-sm font-medium text-white hover:bg-blue-500"
                        >
                            Browse the feed
                        </button>
                    </div>
                )}

                <div className="flex flex-col gap-1">
                    {videos?.map((video) => (
                        <div
                            key={video._id}
                            className={`group flex gap-4 rounded-xl border border-transparent p-3 transition-colors ${row}`}
                        >
                            <button
                                onClick={() => navigate(`/watchvideo/${video._id}`)}
                                className="relative aspect-video w-40 shrink-0 overflow-hidden rounded-lg bg-neutral-900"
                            >
                                <img
                                    src={video.thumbnail}
                                    alt={video.title}
                                    loading="lazy"
                                    className="h-full w-full object-cover"
                                />
                                <span className="absolute bottom-1 right-1 rounded bg-black/80 px-1.5 py-0.5 text-[11px] text-white">
                                    {formatDuration(video.duration)}
                                </span>
                            </button>

                            <button
                                onClick={() => navigate(`/watchvideo/${video._id}`)}
                                className="min-w-0 flex-1 text-left"
                            >
                                <h2 className="line-clamp-2 text-[15px] font-medium leading-5">
                                    {video.title}
                                </h2>
                                <p className={`mt-1 truncate text-[13px] ${darkMode ? "text-neutral-400" : "text-neutral-500"}`}>
                                    {video.owner?.username}
                                </p>
                                <p className={`truncate text-[13px] ${darkMode ? "text-neutral-500" : "text-neutral-400"}`}>
                                    {formatViews(video.views)}
                                    <span className="px-1.5" aria-hidden="true">·</span>
                                    {timeAgo(video.createdAt)}
                                </p>
                            </button>

                            <button
                                onClick={() => remove.mutate(video._id)}
                                disabled={remove.isPending}
                                title="Remove from Saved"
                                className={`h-fit shrink-0 rounded-lg p-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100
                                    ${darkMode ? "hover:bg-neutral-800" : "hover:bg-neutral-200"}`}
                            >
                                <Trash2 size={17} className="text-red-400" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
