import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";

const ChannelIndv = () => {
    const { username } = useParams();
    const [channel, setChannel] = useState(null);
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [videos, setVideos] = useState([]);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);
    const [isLoadingVideos, setIsLoadingVideos] = useState(false);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    const handleSubscribe = async () => {
        if (isSubscribing) return;
        setIsSubscribing(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/users/subscriptions/${channel._id}`,
                {
                    method: "POST",
                    credentials: "include",
                }
            );

            const text = await res.text();
            console.log("RAW RESPONSE:", text);

            let data = {};
            try {
                data = JSON.parse(text);
            } catch (e) {
                console.error("Response is not JSON", e);
            }

            const subscribed = data.data?.subscribed;

            setChannel((prev) => ({
                ...prev,
                isSubscribed: subscribed,
                subscriberCount:
                    prev.subscriberCount + (subscribed ? -1 : 1),
            }));
        } catch (err) {
            console.error(err);
        } finally {
            setIsSubscribing(false);
        }
    };
    const currentUserId = data?.user?._id;

    const fetchChannel = async () => {
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/users/c/${username}`,
                { credentials: "include" }
            );
            const result = await res.json();

            if (result.success) {
                setChannel(result.data);
                console.log(channel)
            }
            if (!res.ok) {
                console.error("Bad request", res.status);
                return;
            }
        } catch (err) {
            console.error(err);
        }
    };

    useEffect(() => {
        if (username) fetchChannel();
    }, [username]);

    const fetchVideos = async (pageNum = 1) => {
        if (!channel?._id) return;
        setIsLoadingVideos(true);
        try {
            const res = await fetch(
                `${import.meta.env.VITE_BACKEND}/api/v1/videos/getvideosbychannel/${channel._id}?page=${pageNum}&limit=10`,
                { credentials: "include" }
            );
            const result = await res.json();
            if (result.success) {
                setVideos((prev) => [...prev, ...result.data.docs]);
                setHasMore(pageNum < result.data.totalPages);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setIsLoadingVideos(false);
        }
    };
    useEffect(() => {
        if (channel?._id) {
            setVideos([]);
            setPage(1);
            fetchVideos(1);
        }
    }, [channel]);

    const handleLoadMore = () => {
        if (hasMore && !isLoadingVideos) {
            const nextPage = page + 1;
            setPage(nextPage);
            fetchVideos(nextPage);
        }
    };

    if (!channel) {
        return <div className="text-white p-10">Loading...</div>;
    }

    return (
        <div className="text-white">
            {/*<div className="w-full  bg-zinc-800">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt=""
            className="w-full h-[40%] object-cover"
          />
        )}
      </div>*/}

            {/* Profile */}
            <div className="max-w-5xl mx-auto px-4 mt-16">
                <div className="flex items-center gap-6">
                    <img
                        src={channel.avatar}
                        alt=""
                        className="w-28 hover:ring-1 hover:ring-yellow-200 hover:scale-105 transition-transform duration-300 ease-in-out h-28 rounded-full border-4 border-zinc-900 object-cover"
                    />

                    <div className="flex items-center">
                        <h2 className="text-2xl font-semibold">{channel.username}</h2>
                        <p className="text-zinc-700 text-sm">
                            {channel.subscriberCount} subscribers
                        </p>
                    </div>

                    <div className="ml-auto">
                        {channel.isSubscribed ? (
                            <button
                                onClick={handleSubscribe}
                                className="bg-zinc-700 px-5 py-2 rounded-full">
                                Subscribed
                            </button>
                        ) : (
                            <button
                                onClick={handleSubscribe}
                                className="bg-red-600 px-5 py-2 rounded-full hover:bg-rose-600 hover:scale-105 transition-transfrom duration-300 ease-in-out">
                                Subscribe
                            </button>
                        )}
                    </div>
                </div>

                {/* Tabs */}
                <div className="mt-6 border-b border-zinc-700 flex gap-6 text-sm">
                    <button className="pb-2 border-b-2 border-white">Videos</button>
                    <button className="pb-2 text-zinc-400">About</button>
                </div>

                {/* Placeholder for videos */}
                <div className="mt-6">
                    <p className="text-zinc-400">Videos will go here...</p>
                </div>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {videos.map((video) => (
                        <div
                            key={video._id}
                            className="bg-zinc-800 rounded-lg overflow-hidden shadow hover:scale-105 transition-transform"
                        >
                            <img
                                src={video.thumbnail}
                                alt={video.title}
                                className="w-full h-40 object-cover"
                            />
                            <div className="p-4">
                                <h3 className="text-lg font-semibold">{video.title}</h3>
                                <p className="text-sm text-zinc-400">
                                    {video.durationFormatted}
                                </p>
                                <p className="text-sm text-zinc-500">{video.views} views</p>
                            </div>
                        </div>
                    ))}
                </div>

            </div>
        </div>
    );
};

export default ChannelIndv;