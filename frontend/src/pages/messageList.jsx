import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LoaderTwo from "../assets/loading2";
import { Check, CheckCheck } from "lucide-react";
export default function MessageList({darkMode}) {

    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();
    

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
    useEffect(() => {
        getConversations();
    }, []);
    if (loading) return <h2><LoaderTwo  text="Loading..." darkMode={darkMode} /></h2>;

    return (
        <div>
            
            <div className="text-2xl font-[Saira] ml-3 mt-3 font-semibold mb-4">Conversations</div>
            <div 
            
            className="flex flex-col gap-2">

                {conversations.length === 0 ? (
                    <div className="text-center font-[500] font-[Saira] text-gray-500 py-3">No conversations yet</div>
                ) : (
                    conversations.map((chat) => (
                        <div
                            key={chat.conversationId}
                            onClick={() => navigate(`/message/${chat.otherUser._id}`)}
                            className="flex items-center gap-3 p-3 rounded-lg border cursor-pointer "
                        >

                            <img
                                src={chat.otherUser.avatar}
                                alt={chat.otherUser.username}
                                className="w-12 h-12 hover:scale-[1.04] hover:shadow-md hover:shadow-purple-300 transition-transform duration-200 ease-in rounded-full object-cover"
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
                            <div>
                                {chat.status=="seen" && (
                                    <div>
                                        <CheckCheck className="text-sky-500"/>
                                    </div>
                                )}
                                {
                                    chat.status=="sent" && (
                                        <Check className="text-red-400"/>
                                    )
                                }
                            </div>

                        </div>
                    ))
                )}
                
            </div>
        <div className="mt-10 border-b-[1.5px] w-full border-zinc-400 "></div>
            
        </div>
    );
}