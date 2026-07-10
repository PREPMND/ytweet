import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LoaderTwo from "../assets/loading2";
export default function MessageList() {

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    useEffect(() => {
        getConversations();
    }, []);

    async function getConversations() {

        try {

            const res = await api.get("/socket/convo");

            setConversations(res.data.data);
            console.log(res.data.data)
        } catch (err) {
            console.log(err);
        } finally {
            setTimeout(() => {
            setLoading(false);}, 1000);
        }

    }

    if (loading) return <h2><LoaderTwo  text="Loading..." darkMode={false} /></h2>;

    return (
        <div>
            
            <div className="text-2xl font-[Saira] ml-3 mt-3 font-semibold mb-4">Conversations</div>
            <div 
            
            className="flex flex-col gap-2">

                {conversations.map((chat) => (

                    <div
                        key={chat.conversationId}
                        onClick={() => navigate(`/message/${chat.otherUser._id}`)}
                        className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer hover:bg-gray-100 transition"
                    >

                        <img
                            src={chat.otherUser.avatar}
                            alt={chat.otherUser.username}
                            className="w-12 h-12 rounded-full object-cover"
                        />

                        <div className="flex ml-2 flex-col flex-1 overflow-hidden">

                            <h2 className="font-[500] text-[16px] font-[Saira] truncate">
                                {chat.otherUser.username}
                            </h2>

                            <p className="text-sm text-gray-500 truncate">
                                {chat.lastMessage}
                            </p>

                        </div>

                        <p className="text-xs text-gray-400">
                            {new Date(chat.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                            })}
                        </p>

                    </div>

                ))}
                <div className="text-center font-[500] font-[Saira] text-gray-500 py-3">End of conversations</div>
            </div>
        </div>
    );
}