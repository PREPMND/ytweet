import api from "./api";

/** Toggle a video in the signed-in user's "Watch later" list. */
export const toggleWatchLater = async (videoId) => {
    const res = await api.post(`/users/watchlater/${videoId}`);
    return res.data.data; // { videoId, watchLater: boolean }
};

/** Hide a video from the feed for this user. */
export const toggleNotInterested = async (videoId) => {
    const res = await api.post(`/users/notinterested/${videoId}`);
    return res.data.data; // { videoId, notInterested: boolean }
};

/** Ids only, so the feed can filter without a second join. */
export const getLibraryIds = async () => {
    const res = await api.get("/users/library");
    return res.data.data; // { watchLater: string[], notInterested: string[] }
};

export const getWatchLater = async () => {
    const res = await api.get("/users/watchlater");
    return res.data.data;
};

/**
 * Share: use the native share sheet where it exists (mobile, some desktops)
 * and fall back to the clipboard. Both paths are async and both can reject --
 * notably, the user simply dismissing the share sheet rejects with
 * AbortError, which is NOT an error worth surfacing.
 */
export const shareVideo = async (video) => {
    const url = `${window.location.origin}/watchvideo/${video._id}`;

    if (navigator.share) {
        try {
            await navigator.share({ title: video.title, url });
            return "shared";
        } catch (err) {
            if (err?.name === "AbortError") return "cancelled";
            // Fall through to the clipboard on any other failure.
        }
    }

    // `navigator.clipboard` only exists in a secure context (https or
    // localhost), so this can be undefined on a LAN IP during development.
    if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(url);
        return "copied";
    }

    throw new Error("Sharing is not available in this browser");
};
