import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import LoaderTwo from "../assets/loading2";
import { Check, CheckCheck } from "lucide-react";
import { socket } from "../socket";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";

export default function MessageList({ darkMode }) {
    const navigate = useNavigate();

    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: 1000 * 60 * 10,
    });
    const [conversations, setConversations] = useState([]);
    const [loading, setLoading] = useState(true);
    const loadConversations = async () => {
        try {
            setLoading(true);
            const { data } = await api.get("/socket/convo");
            setConversations(data.data || []);
            console.log(
            )
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        loadConversations();
    }, []);
    useEffect(() => {
        const currentUser = data?.user;
        const handleReceiveMessage = (message) => {

            setConversations(prev => {

                const index = prev.findIndex(
                    convo => convo.conversationId === message.conversationId
                );

                if (index !== -1) {

                    const updated = {

                        ...prev[index],

                        lastMessage: message,

                        updatedAt: message.createdAt,

                        unreadCount:
                            message.sender.toString() === currentUser._id
                                ? prev[index].unreadCount
                                : (prev[index].unreadCount || 0) + 1
                    };
                    return [
                        updated,
                        ...prev.filter((_, i) => i !== index)
                    ];
                }
                return [
                    {
                        conversationId: message.conversationId,
                        participant: message.senderDetails,
                        lastMessage: message,
                        updatedAt: message.createdAt,
                        unreadCount:
                            message.sender.toString() === currentUser._id
                                ? 0
                                : 1
                    },
                    ...prev
                ];

            });

        };

        socket.on("receive-message", handleReceiveMessage);

        return () => {

            socket.off("receive-message", handleReceiveMessage);

        };

    }, [data]);
    useEffect(() => {

        const handleSeen = ({ conversationId }) => {
            setConversations(prev =>
                prev.map(convo => {
                    if (convo.conversationId !== conversationId)
                        return convo;
                    return {
                        ...convo,
                        unreadCount: 0,
                        lastMessage: {
                            ...convo.lastMessage,
                            status: "seen"
                        }
                    };
                })
            );
        };
        socket.on("messages-seen", handleSeen);
        return () => {
            socket.off("messages-seen", handleSeen);
        };
    }, []);
    useEffect(() => {
        const handleStatus = (payload) => {
            setConversations(prev =>
                prev.map(convo => {
                    if (
                        convo.participant?._id !== payload.userId
                    )
                        return convo;
                    return {
                        ...convo,
                        participant: {
                            ...convo.participant,
                            online: payload.online,
                            lastSeen: payload.lastSeen
                        }
                    };
                })
            );
        };
        socket.on("user-status", handleStatus);
        return () => {
            socket.off("user-status", handleStatus);
        };

    }, []);
    const clearUnread = (conversationId) => {

        setConversations(prev =>

            prev.map(convo =>

                convo.conversationId === conversationId

                    ? {

                        ...convo,

                        unreadCount: 0

                    }

                    : convo

            )

        );

    };
    if (loading) return <h2><LoaderTwo text="Loading..." darkMode={darkMode} /></h2>;

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
                            onClick={() =>
                                navigate(`/message/${chat.otherUser?._id}`, {
                                    state: {
                                        receiver: chat.otherUser,
                                    },
                                })
                            }
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
                                {chat.status == "seen" && (
                                    <div>
                                        <CheckCheck className="text-sky-500" />
                                    </div>
                                )}
                                {
                                    chat.status == "sent" && (
                                        <Check className="text-red-400" />
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