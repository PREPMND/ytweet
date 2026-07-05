import { useEffect, useState } from "react";
import api from "../api/api";

export default function MessageList() {

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getConversations();
    }, []);

    async function getConversations() {

        try {

            const res = await api.get("/socket");

            setConversations(res.data.data);

        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }

    }

    if (loading) return <h2>Loading...</h2>;

    return (
        <div>

            {conversations.map((chat) => (

                <div
                    key={chat._id}
                    className="border p-3 mb-2 cursor-pointer"
                >

                    <p>{chat.text}</p>

                    <small>{chat.conversationId}</small>

                </div>

            ))}

        </div>
    );
}