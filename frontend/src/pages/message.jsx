import { useEffect, useState } from "react";
import api from "../api/api";
import { socket } from "../socket";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";


export default function Messages({ currentId }) {
    const { receiverId } = useParams();
    console.log(useParams());
    const receiver = receiverId ? receiverId : null;
    console.log("receiverId:", receiver);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    // Backend generates the same conversationId
    const conversationId =
        receiver
            ? [currentId, receiver].sort().join("_")
            : "";
    async function loadMessages() {

        try {

            const res = await api.get(`/socket/${receiver}`);
            console.log("Messages:", res.data.data);
            setMessages(res.data.data);

        }
        catch (err) {
            console.log(err);
        }

    }
    useEffect(() => {

        if (!receiver) return;

        socket.connect();

        socket.emit("join-room", conversationId);

        socket.on("receive-message", (msg) => {
            setMessages(prev => [...prev, msg]);
        });

        loadMessages();

        return () => {
            socket.off("receive-message");
            socket.disconnect();
        };

    }, [receiver]);



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

        }
        catch (err) {
            console.log(err);
        }

    }

    return (

        <div className={`w-full  h-screen no-scrollbar overflow-y-auto`}   >

            <h2 className={`mt-2 ml-4 text-xl font-[Saira]`}>Messages</h2>

            <div className={`w-full h-[calc(100%-50px)] overflow-y-auto flex flex-col gap-2 p-2 pl-4 pr-4 pb-20 no-scrollbar`}>

                {messages.map((msg, i) => (

                    <div

                        className={`w-fit max-w-[70%]  break-words px-2 py-1 rounded-md ${msg.sender == currentId ? "bg-blue-400 border-[1.5px] border-cyan-400  text-white self-end" : "bg-gray-300 bor text-black self-start"} text-[17px] `}
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

        </div>

    );

}