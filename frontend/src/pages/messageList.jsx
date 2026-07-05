import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
export default function MessageList() {

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        getConversations();
    }, []);

    async function getConversations() {

        try {

            const res = await api.get("/socket");

            setConversations(res.data.data);
            console.log(res.data.data)
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
                    onClick={() => navigate(`/message/${chat.receiver}`)}
                    key={chat._id}
                    className="border p-3 mb-2 cursor-pointer"
                >

                    <p>{chat.text}</p>
                </div>

            ))}

        </div>
    );
}