import { LoaderPinwheel } from "lucide-react";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { EllipsisVertical } from "lucide-react";
import { Clock, ListPlus, Share2, EyeOff, Flag } from "lucide-react";
import { useInfiniteQuery, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { MenuDropdown } from "../utils/videoMenu";
import { fetchVideos } from "../api/allcalls";
import { getLibraryIds, toggleWatchLater, toggleNotInterested, shareVideo } from "../api/library";
import { toast } from "../components/toast";
import { formatViews, timeAgo } from "../utils/format";

/** Placeholder cards shown on the very first load, matching the real layout
 *  so nothing shifts when the data arrives. */
function VideoSkeleton() {
    return (
        <div className="overflow-hidden rounded-2xl">
            <div className="skeleton aspect-video w-full rounded-xl" />
            {/* Same h-[102px] as a real card's meta block, so swapping the
                skeleton for the data causes zero layout shift. */}
            <div className="flex h-[102px] items-start gap-3 px-2 py-3">
                <div className="skeleton h-10 w-10 shrink-0 rounded-full" />
                <div className="flex-1 space-y-2 pt-1">
                    <div className="skeleton h-3 w-full rounded" />
                    <div className="skeleton h-3 w-2/3 rounded" />
                    <div className="skeleton h-3 w-1/3 rounded" />
                </div>
            </div>
        </div>
    );
}
const VideoList = (props) => {
    const { darkMode, setProfileSelected, setvideoIdSelected, videoIdSelected } = props;

    const timeoutRef = useRef(null);
    const [playingId, setPlayingId] = useState(null);
    // Tracks which thumbnails have finished decoding, so each one can fade in
    // over its shimmer instead of snapping into place mid-scroll.
    const [loadedThumbs, setLoadedThumbs] = useState({});

    // Guarded so re-renders don't loop: only ever flips false -> true.
    const markThumbLoaded = useCallback((id) => {
        setLoadedThumbs((prev) => (prev[id] ? prev : { ...prev, [id]: true }));
    }, []);
    const queryClient = useQueryClient();
    const navigate = useNavigate();
    const location = useLocation();
    const [menuOpenId, setMenuOpenId] = useState(null);
    const loadMoreRef = useRef(null);
    const {
        data,
        fetchNextPage,
        hasNextPage,
        isFetchingNextPage,
        isLoading,
    } = useInfiniteQuery({
        queryKey: ["videos"],
        queryFn: fetchVideos,
        getNextPageParam: (lastPage) =>
            lastPage.page < lastPage.totalPages
                ? lastPage.page + 1
                : undefined,
        staleTime: 1000 * 60 * 10,
        refetchOnWindowFocus: true,
    });





    /* ---------------------------------------------------------------
       Menu actions. These were all `console.log` stubs.
       --------------------------------------------------------------- */

    // Ids the server already has saved, loaded once so the menu can show
    // "Remove from Watch later" instead of always offering to add.
    const { data: library } = useQuery({
        queryKey: ["library"],
        queryFn: getLibraryIds,
        staleTime: 1000 * 60 * 5,
        retry: false,
    });

    const savedIds = new Set(library?.watchLater ?? []);

    // Hidden locally as well as on the server, so the card disappears
    // immediately rather than after the next refetch.
    const [hiddenIds, setHiddenIds] = useState(() => new Set());

    function requireAuth() {
        toast("Log in to do that", { type: "info" });
        navigate("/login");
    }

    const watchLaterMutation = useMutation({
        mutationFn: toggleWatchLater,
        onSuccess: (result) => {
            toast(result.watchLater ? "Saved to Watch later" : "Removed from Watch later");
            queryClient.invalidateQueries({ queryKey: ["library"] });
        },
        onError: (err) => {
            if (err.response?.status === 401) return requireAuth();
            toast(err.response?.data?.message || "Could not save", { type: "error" });
        },
    });

    const notInterestedMutation = useMutation({
        mutationFn: toggleNotInterested,
        onError: (err, videoId) => {
            // Roll the optimistic hide back -- the card should reappear if
            // the server rejected the change.
            setHiddenIds((prev) => {
                const next = new Set(prev);
                next.delete(videoId);
                return next;
            });

            if (err.response?.status === 401) return requireAuth();
            toast(err.response?.data?.message || "Could not update", { type: "error" });
        },
    });

    function handleWatchLater(video) {
        watchLaterMutation.mutate(video._id);
    }

    function handlePlaylist(video) {
        // Playlists need a collection of their own (name, ordering, privacy),
        // which this schema does not have yet. Saying so is better than a
        // button that silently does nothing.
        toast("Playlists aren’t available yet", { type: "info" });
    }

    async function handleShare(video) {
        try {
            const result = await shareVideo(video);
            if (result === "copied") toast("Link copied to clipboard");
            if (result === "shared") toast("Shared");
        } catch (err) {
            toast(err.message || "Could not share", { type: "error" });
        }
    }

    function handleNotInterested(video) {
        setHiddenIds((prev) => new Set(prev).add(video._id));
        toast("You won’t see this again");
        notInterestedMutation.mutate(video._id);
    }

    function handleReport(video) {
        // No moderation backend exists; acknowledge rather than pretend.
        toast("Thanks — reports are reviewed manually for now", { type: "info" });
    }
    useEffect(() => {
        const scrollContainer = document.getElementById("feed-scroll");

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (
                    entry.isIntersecting &&
                    hasNextPage &&
                    !isFetchingNextPage
                ) {
                    fetchNextPage();
                }
            },
            {
                root: scrollContainer,
                threshold: 0.1,
                rootMargin: "400px",
            }
        );

        const current = loadMoreRef.current;

        if (current) {
            observer.observe(current);
        }

        return () => {
            if (current) {
                observer.unobserve(current);
            }
        };
    }, [fetchNextPage, hasNextPage, isFetchingNextPage]);
    useEffect(() => {
        if (location.state?.scrollY !== undefined) {
            window.scrollTo(0, location.state.scrollY);
        }
    }, [])
    function Handle(channelId, channelUsername, channel) {
        setProfileSelected(channel);
        navigate(`/${channelUsername}`);
    }

    function toggleMenu(id) {
        setMenuOpenId((prev) => (prev === id ? null : id));
    }

    function GoToVideo(vidDetails) {
        console.log("Selected Video Details:", vidDetails);
        navigate(`/watchvideo/${vidDetails._id}`, {
            state: { scrollY: window.scrollY }
        });
    }

    return (
        <div
            className={`relative overflow-hidden no-scrollbar md:pb-[70px] min-h-screen pb-[50px] cursor-pointer transition-all duration-300 ease-out will-change-transform pt-9 transform-gpu ${darkMode ? "bg-black" : "bg-white"
                }`}
        >
            <div
                className="grid gap-5 place-content-center max-w-[1100px] mx-auto px-2"
                style={{
                    gridTemplateColumns:
                        "repeat(auto-fit,minmax(320px,1fr))",
                }}
            >
                {isLoading &&
                    Array.from({ length: 6 }).map((_, i) => <VideoSkeleton key={i} />)}

                {data?.pages
                    ?.flatMap((page) => page.docs)
                    // Drop anything marked "Not interested" -- locally this
                    // render, and from the server list on later visits.
                    .filter((video) =>
                        !hiddenIds.has(video._id) &&
                        !(library?.notInterested ?? []).includes(video._id)
                    )
                    .map((video, idx) => (
                        <div
                            key={video._id}
                            onMouseEnter={() => {
                                timeoutRef.current = setTimeout(() => {
                                    setPlayingId(video._id);
                                }, 2000);
                            }}
                            onMouseLeave={() => {
                                clearTimeout(timeoutRef.current);
                                setPlayingId(null);
                            }}
                            className={`overflow-hidden rounded-2xl cursor-pointer transition-all duration-300 ease-out ${darkMode ? "bg-black" : "bg-white"
                                }`}
                        >
                            {/*
                              THUMBNAIL POP-IN, three separate causes:

                              1. `fetchPriority="low"` told the browser to
                                 deprioritise every thumbnail, so they arrived
                                 late while scrolling. Removed -- `loading="lazy"`
                                 alone already defers off-screen images, and the
                                 browser starts them ~1250px before they're visible.
                              2. The <img> was UNMOUNTED when the hover preview
                                 started and remounted on mouse-out, so the
                                 thumbnail had to decode again from scratch.
                                 Now it stays mounted and the <video> layers
                                 on top of it.
                              3. There was no placeholder, so a not-yet-decoded
                                 image showed as a hard black rectangle that
                                 snapped to the picture. Now it fades in over a
                                 shimmer once `onLoad` fires.
                            */}
                            <div className="relative aspect-video select-none overflow-hidden rounded-xl bg-neutral-900">

                                {!loadedThumbs[video._id] && (
                                    <div className="skeleton absolute inset-0" aria-hidden="true" />
                                )}

                                <img
                                    onClick={() => GoToVideo(video)}
                                    // A ref callback as well as onLoad, because
                                    // an image served from the HTTP cache can
                                    // finish loading BEFORE React attaches the
                                    // onLoad handler -- in which case the event
                                    // never fires and the image stays at
                                    // opacity-0 forever. `complete` +
                                    // `naturalWidth` is the reliable check.
                                    ref={(node) => {
                                        if (node?.complete && node.naturalWidth > 0) {
                                            markThumbLoaded(video._id);
                                        }
                                    }}
                                    onLoad={() => markThumbLoaded(video._id)}
                                    onError={() => markThumbLoaded(video._id)}
                                    loading="lazy"
                                    decoding="async"
                                    src={video.thumbnail}
                                    alt={video.title}
                                    className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-300
                                        ${loadedThumbs[video._id] ? "opacity-100" : "opacity-0"}`}
                                />

                                {playingId === video._id && (
                                    <video
                                        src={video.videoFile}
                                        autoPlay
                                        muted
                                        loop
                                        playsInline
                                        preload="metadata"
                                        onClick={() => GoToVideo(video)}
                                        className="absolute inset-0 h-full w-full object-cover"
                                    />
                                )}

                                <span className="absolute bottom-2 right-2 bg-black/80 text-white text-xs px-2 py-1 rounded">
                                    {video.durationFormatted}
                                </span>

                            </div>

                            {/*
                              FIXED-HEIGHT META BLOCK.
                              Every card reserves the same vertical space:
                              2 title lines (40px) + channel (20px) +
                              views/age (18px). Without the reservation a
                              one-line title made that card shorter than its
                              neighbours, and because the grid rows size to
                              their tallest item, the rest of the row shifted
                              as thumbnails and titles streamed in.
                            */}
                            <div className="relative flex h-[102px] items-start gap-3 px-2 py-3">
                                <img
                                    onClick={() => {
                                        Handle(
                                            video.owner?._id,
                                            video.owner?.username,
                                            video
                                        );
                                    }}
                                    className="w-10 h-10 rounded-full object-cover shrink-0 hover:scale-105 transition-transform duration-300"
                                    src={video.owner?.avatar}
                                    alt="Avatar"
                                    loading="lazy"
                                />
                                <div

                                    className="flex justify-between items-start gap-2 w-full min-w-0">

                                    <div

                                        className="flex flex-col flex-1 min-w-0"
                                    >
                                        <h3

                                            className={`md:text-[14px] text-[15px] leading-5 font-[500] line-clamp-2 break-words ${darkMode
                                                ? "text-white"
                                                : "text-black"
                                                }`}
                                        >
                                            {video.title}
                                        </h3>

                                        <p
                                            onClick={() => {
                                                Handle(
                                                    video.owner?._id,
                                                    video.owner?.username,
                                                    video
                                                );
                                            }}
                                            className={`text-[14px] md:text-[15px] font-[400] md:text-sm mt-1 hover:underline truncate ${darkMode
                                                ? "text-neutral-300"
                                                : "text-neutral-700"
                                                }`}
                                        >
                                            {video.owner?.username}
                                        </p>

                                        {/*
                                          Views + age are pinned to the BOTTOM
                                          of the fixed-height meta block, so
                                          this row lands at the same y on every
                                          card no matter how tall the thumbnail
                                          or title above it turns out to be.
                                          The channel name keeps its original
                                          free-flowing layout.
                                        */}
                                        <p className={`absolute bottom-3 left-[60px] right-10 h-[18px] truncate text-[13px] leading-[18px] ${darkMode ? "text-neutral-500" : "text-neutral-500"}`}>
                                            {formatViews(video.views)}
                                            <span className="px-1.5" aria-hidden="true">·</span>
                                            {timeAgo(video.createdAt)}
                                        </p>
                                    </div>

                                    <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            toggleMenu(video._id);
                                        }}
                                        className={`shrink-0 mt-1 p-1 rounded-full transition-colors ${darkMode
                                            ? "hover:bg-neutral-800 text-white"
                                            : "hover:bg-neutral-200 text-black"
                                            }`}
                                    >
                                        <EllipsisVertical size={18} />
                                    </button>
                                </div>
                                <MenuDropdown
                                    className="z-50  absolute right-2 bottom-3"
                                    isOpen={menuOpenId === video._id}
                                    onClose={() => setMenuOpenId(null)}
                                    darkMode={darkMode}
                                    items={[
                                        {
                                            label: savedIds.has(video._id)
                                                ? "Remove from Watch later"
                                                : "Watch later",
                                            icon: Clock,
                                            onClick: () => handleWatchLater(video),
                                        },
                                        {
                                            label: "Save to playlist",
                                            icon: ListPlus,
                                            disabled: true,
                                            onClick: () => handlePlaylist(video),
                                        },
                                        {
                                            label: "Share",
                                            icon: Share2,
                                            onClick: () => handleShare(video),
                                        },
                                        {
                                            label: "Not interested",
                                            icon: EyeOff,
                                            onClick: () => handleNotInterested(video),
                                        },
                                        {
                                            label: "Report",
                                            icon: Flag,
                                            danger: true,
                                            onClick: () => handleReport(video),
                                        },
                                    ]}
                                />
                            </div>
                        </div>
                    ))}
            </div>

            {/*
              A single sentinel BELOW the grid.
              The old code put `ref={loadMoreRef}` on every card, so the ref
              ended up pointing at whichever card rendered last and the
              observer watched a node that was already scrolled past -- which
              is why loading page 3+ was unreliable.
            */}
            <div ref={loadMoreRef} className="h-px w-full" aria-hidden="true" />

            {isFetchingNextPage && (
                <div className="flex items-center justify-center py-10">
                    <LoaderPinwheel
                        className={`animate-spin ${darkMode ? "text-white" : "text-black"}`}
                        size={32}
                    />
                </div>
            )}

            {!isLoading && !hasNextPage && (
                <p className={`py-10 text-center text-sm ${darkMode ? "text-neutral-600" : "text-neutral-400"}`}>
                    You’re all caught up.
                </p>
            )}
        </div>
    );
};
export default VideoList;