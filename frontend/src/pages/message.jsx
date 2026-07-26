import { useEffect, useState, useRef, useMemo } from "react";
import api from "../api/api";
import { socket } from "../socket";
import { Send, Check, CheckCheck } from "lucide-react";
import { useParams, useLocation } from "react-router-dom";
import LoaderTwo from "../assets/loading2";
import { useQuery } from "@tanstack/react-query";
import getCurrentUser from "../api/currentuser";
export default function Messages({ darkMode, themeSelected }) {
    const bottomRef = useRef(null);
    const { data } = useQuery({
        queryKey: ["currentUser"],
        queryFn: getCurrentUser,
        staleTime: 1000 * 60 * 10,
    });
    const { state } = useLocation();
    console.log(themeSelected)
    const [receiver, setReceiver] = useState(state?.receiver || null);
    const { receiverId } = useParams()

    const [messages, setMessages] = useState([]);

    const [loading, setLoading] = useState(true);
    const [onlineUsers, setOnlineUsers] = useState({});
    const [typing, setTyping] = useState(false);
    const [sending, setSending] = useState(false);
    const [text, settext] = useState("");
    const conversationId = useMemo(() => {
        if (!data?.user._id || !receiverId) return null;

        return [data.user?._id, receiverId]
            .sort()
            .join("_");
    }, [data, receiverId]);
    const loadMessages = async () => {
        if (!conversationId) return;
        try {
            setLoading(true);
            const { data } = await api.get(
                `/socket/${receiverId}`
            );

            setMessages(data.data || []);
        } catch (err) {
            console.log(err);
        } finally {
            setLoading(false);
        }
    };
    const markMessagesAsSeen = async () => {
        if (!conversationId) return;
        try {

            await api.patch(
                `/socket/seen/${conversationId}`
            );
            socket.emit("messages-seen", {
                conversationId,
                readerId: data._id
            });

        } catch (err) {
            console.log(err);
        }
    };
    const sendMessage = async () => {
        if (!text.trim()) return;
        try {
            setSending(true);
            const { data } = await api.post("/socket/send", {
                receiver: receiverId,
                text,
            });
            const savedMessage = data.data;
            // avoid duplicate
            setMessages(prev => {
                if (
                    prev.some(
                        msg => msg._id === savedMessage._id
                    )
                ) return prev;
                return [...prev, savedMessage];
            });
            // notify socket microservice
            socket.emit(
                "send-message",
                savedMessage
            );
            settext("");
        } catch (err) {

            console.log(err);

        } finally {

            setSending(false);

        }
    };

    useEffect(() => {

        if (!conversationId) return;
        loadMessages();

    }, [conversationId]);

    useEffect(() => {
        if (!conversationId) return;

        socket.emit(
            "join-room",
            conversationId
        );
        console.log(conversationId)
    }, [conversationId]);
    useEffect(() => {

        const receiveMessage = (message) => {
            console.log("RECEIVED:", message);

            if (message.conversationId !== conversationId) return;
            setMessages(prev => {

                if (prev.some(msg => msg._id === message._id))
                    return prev;

                return [...prev, message];
            });
            markMessagesAsSeen();
        };
        socket.on("receive-message", receiveMessage);
        return () => {
            socket.off("receive-message", receiveMessage);
        };

    }, [conversationId]);
    useEffect(() => {

        if (!receiver) return;

        setOnlineUsers(prev => ({
            ...prev,
            [receiver._id]: {
                userId: receiver._id,
                isOnline: receiver.isOnline,
                lastSeen: receiver.lastSeen,
            }
        }));

    }, [receiver]);
    useEffect(() => {

        const handleStatus = (payload) => {

            setOnlineUsers(prev => ({
                ...prev,
                [payload.userId]: payload
            }));

        };

        socket.on(
            "user-status",
            handleStatus
        );
        return () => {
            socket.off(
                "user-status",
                handleStatus
            );

        };

    }, []);
    useEffect(() => {

        const handleSeen = ({ conversationId }) => {

            setMessages(prev =>
                prev.map(msg => ({
                    ...msg,
                    status: "seen"
                }))
            );

        };

        socket.on(
            "messages-seen",
            handleSeen
        );

        return () => {

            socket.off(
                "messages-seen",
                handleSeen
            );

        };

    }, []);
    useEffect(() => {
        const handleTyping = ({ userId }) => {

            if (userId === receiver?._id)
                setTyping(true);

        };
        const handleStopTyping = () => {
            setTyping(false);
        };
        socket.on("typing", handleTyping);
        socket.on("stop-typing", handleStopTyping);
        return () => {

            socket.off("typing", handleTyping);
            socket.off("stop-typing", handleStopTyping);

        };

    }, [receiver]);
    const isDesktop = window.innerWidth >= 640;
    
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
        
    }, [messages]);
    return (
        <div className="w-full h-[100dvh] flex flex-col">

            <div
                className={`fixed top-0 left-0 right-0 h-[65px] z-50 flex items-center px-5 border-b
            ${darkMode
                        ? "bg-black text-white border-neutral-700"
                        : "bg-white text-black border-neutral-300"
                    }`}
            >

                <img
                    src={
                        receiver?.avatar ||
                        "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"
                    }
                    className="w-11 h-11 rounded-full object-cover"
                />

                <div className="ml-4">

                    <h2 className="font-semibold text-lg">
                        {receiver?.fullName || "User"}
                    </h2>

                    {typing ? (
                        <p className="text-xs text-green-500 animate-pulse">
                            Typing...
                        </p>
                    ) : onlineUsers?.[receiverId]?.isOnline ? (
                        <p className="text-xs text-green-500">
                            ● Online
                        </p>
                    ) : (
                        <p className="text-xs text-gray-500">
                            Offline
                        </p>
                    )}

                </div>

            </div>

            <div
                className={`flex-1 mt-[65px] pb-[78px] relative overflow-y-auto no-scrollbar flex flex-col gap-3 p-4
            `}
                style={{
                    backgroundImage: `url(${themeSelected})`,
                    backgroundSize: isDesktop ? "cover" : "contain",
                    backgroundPosition: "center",
                    backgroundRepeat: "repeat",
                }}
            >
                {loading ? (

                    <div className="flex justify-center mt-20">
                        <LoaderTwo />
                    </div>

                ) : (

                    messages.map((msg) => {

                        const senderId =
                            typeof msg.sender === "object"
                                ? msg.sender._id
                                : msg.sender;

                        const mine = senderId === data?.user?._id;
                        return (
                            <div>
                                <div
                                    key={msg._id}
                                    className={`flex ${mine ? "justify-end" : "justify-start"
                                        }`}
                                >
                                    <div
                                        className={`max-w-[75%] rounded-2xl px-4 py-2 break-words shadow
                                ${mine
                                                ? "bg-blue-500 text-white"
                                                : darkMode
                                                    ? "bg-neutral-800 text-white"
                                                    : "bg-neutral-200 text-black"
                                            }`}
                                    >

                                        <p>{msg.text}</p>

                                        <div className="flex justify-end items-center gap-1 mt-1 text-[10px] opacity-70">

                                            <span>
                                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                                    hour: "2-digit",
                                                    minute: "2-digit",
                                                })}
                                            </span>

                                            {mine && (
                                                msg.status === "seen" ? (
                                                    <CheckCheck
                                                        size={13}
                                                        className="text-sky-300"
                                                    />
                                                ) : (
                                                    <Check
                                                        size={13}
                                                    />
                                                )
                                            )}

                                        </div>

                                    </div>

                                </div>
                            </div>
                        );

                    })

                )}

                <div ref={bottomRef}></div>

            </div>

            {/* Input */}

            <div
                className={`fixed bottom-0 left-0 right-0 z-50 border-t flex items-center gap-3 p-3
            ${darkMode
                        ? "bg-black border-neutral-700"
                        : "bg-white border-neutral-300"
                    }`}
            >

                <input
                    value={text}
                    onChange={(e) => {

                        settext(e.target.value);

                        socket.emit("typing", {
                            conversationId,
                            userId: data?.user?._id,
                        });

                        clearTimeout(window.typingTimeout);

                        window.typingTimeout = setTimeout(() => {

                            socket.emit("stop-typing", {
                                conversationId,
                                userId: data?.user?._id,
                            });

                        }, 800);

                    }}
                    onKeyDown={(e) => {

                        if (e.key === "Enter" && !sending) {

                            e.preventDefault();
                            settext("");
                            sendMessage();

                        }

                    }}
                    placeholder="Type a message..."
                    className={`flex-1 rounded-full border px-5 py-3 outline-none
                ${darkMode
                            ? "bg-neutral-900 border-neutral-700 text-white"
                            : "bg-white border-neutral-300 text-black"
                        }`}
                />

                <button
                    disabled={sending}
                    onClick={() => {
                        sendMessage();
                    }}
                    className="bg-blue-500 hover:bg-blue-600 transition rounded-full p-3 text-white disabled:opacity-50"
                >

                    <Send size={18} />

                </button>

            </div>

        </div>

        //         <div className={`w-full h-[100dvh] flex flex-col no-scrollbar`}   >
        //             <div className={`w-full h-[65px] md:pl-8 flex items-center border-b ${darkMode ? "bg-black text-white border-neutral-700" : "bg-white text-black border-neutral-300"}`}>
        //                 <img src={receiverInfo?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} alt={receiverInfo?.fullName || "User"} className="w-10 h-10 rounded-full object-cover ml-4 " />
        //                 <h2 className={` ml-4 text-xl font-[Saira]`}>{receiverInfo?.fullName || "User"}</h2>
        //                 <div>
        //                     {receiverInfo?.isOnline ? (
        //                         <span className="ml-2 animate-pulse text-sm text-green-500">Online</span>
        //                     ) : (
        //                         <span className="ml-2 text-sm text-gray-500">Offline</span>
        //                     )}
        //                 </div>

        //             </div>

        //             <div className={`w-full h-[calc(100%-50px)] overflow-y-auto flex flex-col gap-2 p-2 pl-4 pr-4 pb-20 no-scrollbar`}>

        //                 {messages.map((msg, i) => {
        //                     const senderId =
        //                         typeof msg.sender === "object"
        //                             ? msg.sender._id
        //                             : msg.sender;

        //                     return (
        //                         <div
        //                             key={i}
        //                             ref={bottomRef}
        //                             className={`w-fit max-w-[75%] break-words px-2 py-1 rounded-md ${senderId === currentId
        //                                 ? "bg-blue-400 border-[1.5px] border-cyan-400 text-white self-end"
        //                                 : "bg-gray-300 border-slate-400 text-black self-start"
        //                                 } text-[17px] border-[1.5px]`}
        //                         >
        //                             {msg.text}
        //                         </div>
        //                     );
        //                 })}

        //             </div>


        //             <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex items-center gap-2 z-50">

        //                 <input
        //                     onKeyDown={(e) => {
        //                         if (e.key === "Enter") {
        //                             sendMessage();
        //                         }
        //                     }}
        //                     value={message}
        //                     onChange={(e) => setMessage(e.target.value)}
        //                     placeholder="Type..."
        //                     className=" sm:min-w-[70%] sm:ml-4  hover:border-slate-700 hover:border-1 border-1 border-neutral-900 rounded-md px-3 py-2"
        //                 />
        //                 <button
        //                     onClick={sendMessage}
        //                     className="p-2 rounded-full sm:ml-6 transition-all duration-150 "
        //                 >
        //                     <Send
        //                         className="transition-all duration-200 hover:scale-110 hover:text-amber-300"
        //                         size={22}
        //                     />
        //                 </button>

        //             </div>
        //             {rateLimitMessage && (
        //                 <div
        //                     className="text-[14px] font-[Saira] md:text-[17px]
        //     fixed bottom-20 left-1/2
        //     -translate-x-1/2
        //     bg-neutral-900
        //     text-white
        //     px-5 max-w-[50%]
        //     py-3
        //     rounded-xl
        //     shadow-2xl
        //     border
        //     border-neutral-700
        //     z-[9999]
        //     animate-toast
        // ">
        //                     You're sending messages too quickly.
        //                 </div>
        //             )}
        //         </div>


    );

}