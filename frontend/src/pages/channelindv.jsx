import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";

const ChannelIndv = () => {
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
    });
    console.log("CURRENT USER DATA:", data);
    setChannel(data.user);
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


    return (
        <div>ieifhwe</div>
    )
            
};

export default ChannelIndv;