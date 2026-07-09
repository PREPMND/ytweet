import { useEffect, useState, useRef } from "react";
import api from "../api/api";
import { socket } from "../socket";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";


export default function Messages({ currentId, darkMode }) {
    const { receiverId } = useParams();
    console.log(useParams());
    const receiver = receiverId ? receiverId : null;
    console.log("receiverId:", receiver);
    const conversationId =
        receiver
            ? [currentId, receiver].sort().join("_")
            : "";
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");
    const [receiverInfo, setReceiverInfo] = useState(null);
    const [rateLimitMessage, setRateLimitMessage] = useState(false);
    const bottomRef = useRef(null);
    async function loadMessages() {
        try {
            const res = await api.get(`/socket/${receiver}`);
            setMessages(res.data.data);
        } catch (err) {
            console.log(err);
        }
    }

    async function loadReceiver() {
        try {
            const res = await api.post("/users/userbyid", {
                userId: receiver,
            });
            setReceiverInfo(res.data.data);
            console.log("Receiver Info:", res.data.data);
        } catch (err) {
            console.log(err);
        }
    }

    useEffect(() => {
        if (!receiver) return;

        socket.connect();

        socket.emit("register-user", currentId);
        socket.emit("join-room", conversationId);

        loadMessages();
        loadReceiver();

        socket.on("receive-message", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        socket.on("user-status", (status) => {
            if (status.userId === receiver) {
                setReceiverInfo(prev => ({
                    ...prev,
                    isOnline: status.isOnline,
                    lastSeen: status.lastSeen,
                }));
            }
        });

        return () => {
            socket.off("receive-message");
            socket.off("user-status");
            socket.disconnect();
        };

    }, [receiver, currentId]);

    async function sendMessage() {
        if (!message.trim()) return;

        try {
            const res = await api.post("/socket/send", {
                receiver,
                text: message,
            });

            const savedMessage = res.data.data;

            setMessages(prev => [...prev, savedMessage]);

            socket.emit("send-message", savedMessage);

            setMessage("");

        } catch (err) {
            if (err.response?.status === 429) {
                setRateLimitMessage(true);

                clearTimeout(window.rateLimitTimer);

                window.rateLimitTimer = setTimeout(() => {
                    setRateLimitMessage(false);
                }, 2000);
                return;
            }
            console.log(err);
        }
    }
    useEffect(() => {
        bottomRef.current?.scrollIntoView({
            behavior: "smooth",
        });
    }, [messages]);
    return (

        <div className={`w-full h-[100dvh] flex flex-col no-scrollbar`}   >
            <div className={`w-full h-[65px] md:pl-8 flex items-center border-b ${darkMode ? "bg-black text-white border-neutral-700" : "bg-white text-black border-neutral-300"}`}>
                <img src={receiverInfo?.avatar || "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png"} alt={receiverInfo?.fullName || "User"} className="w-10 h-10 rounded-full object-cover ml-4 " />
                <h2 className={` ml-4 text-xl font-[Saira]`}>{receiverInfo?.fullName || "User"}</h2>
                <div>
                    {receiverInfo?.isOnline ? (
                        <span className="ml-2 animate-pulse text-sm text-green-500">Online</span>
                    ) : (
                        <span className="ml-2 text-sm text-gray-500">Offline</span>
                    )}
                </div>

            </div>

            <div className={`w-full h-[calc(100%-50px)] overflow-y-auto flex flex-col gap-2 p-2 pl-4 pr-4 pb-20 no-scrollbar`}>

                {messages.map((msg, i) => (

                    <div
                        ref={bottomRef}
                        className={`w-fit max-w-[75%]  break-words px-2 py-1 rounded-md ${msg.sender == currentId ? "bg-blue-400 border-[1.5px] border-cyan-400  text-white self-end" : "bg-gray-300 border-slate-400 text-black self-start"} text-[17px] border-[1.5px]`}
                        key={i}>

                        {msg.text}
                    </div>

                ))}

            </div>


            <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-3 flex items-center gap-2 z-50">

                <input
                    onKeyDown={(e) => {
                        if (e.key === "Enter") {
                            sendMessage();
                        }
                    }}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type..."
                    className=" sm:min-w-[70%] sm:ml-4  hover:border-slate-700 hover:border-1 border-1 border-neutral-900 rounded-md px-3 py-2"
                />
                <button
                    onClick={sendMessage}
                    className="p-2 rounded-full sm:ml-6 transition-all duration-150 "
                >
                    <Send
                        className="transition-all duration-200 hover:scale-110 hover:text-amber-300"
                        size={22}
                    />
                </button>

            </div>
            {rateLimitMessage && (
                <div
                    className="
    fixed bottom-20 left-1/2
    -translate-x-1/2
    bg-neutral-900
    text-white
    px-5
    py-3
    rounded-xl
    shadow-2xl
    border
    border-neutral-700
    z-[9999]
    animate-toast
">
                    You're sending messages too quickly. Please wait a moment.
                </div>
            )}
        </div>


    );

}