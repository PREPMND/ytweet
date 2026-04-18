import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";

const ChannelIndv = () => {
  const { username } = useParams();
  const [channel, setChannel] = useState(null);

  const { data } = useQuery({
    queryKey: ["currentUser"],
    queryFn: getCurrentUser,
  });

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
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (username) fetchChannel();
  }, [username]);

  if (!channel) {
    return <div className="text-white p-10">Loading...</div>;
  }

  return (
    <div className="text-white">
      <div className="w-full  bg-zinc-800">
        {channel.coverImage && (
          <img
            src={channel.coverImage}
            alt=""
            className="w-full h-[40%] object-cover"
          />
        )}
      </div>

      {/* Profile */}
      <div className="max-w-5xl mx-auto px-4 -mt-16">
        <div className="flex items-center gap-6">
          <img
            src={channel.avatar}
            alt=""
            className="w-28 h-28 rounded-full border-4 border-zinc-900 object-cover"
          />

          <div>
            <h2 className="text-2xl font-semibold">{channel.username}</h2>
            <p className="text-zinc-400 text-sm">
              {channel.subscriberCount} subscribers
            </p>
          </div>

          <div className="ml-auto">
            {channel.isSubscribed ? (
              <button className="bg-zinc-700 px-5 py-2 rounded-full">
                Subscribed
              </button>
            ) : (
              <button className="bg-red-600 px-5 py-2 rounded-full hover:bg-red-700">
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
      </div>
    </div>
  );
};

export default ChannelIndv;