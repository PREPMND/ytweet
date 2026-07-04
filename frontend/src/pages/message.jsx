import { useEffect, useState } from "react";
import api from "../api/api";
import { socket } from "../socket";
import { Send } from "lucide-react";
import { useParams } from "react-router-dom";


export default function Messages({ currentId }) {
    const { receiverId } = useParams();

    const receiver = receiverId;
    console.log("receiverId:", receiverId);
    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    // Backend generates the same conversationId
    const conversationId = [currentId, receiver]
        .sort()
        .join("_");
    async function loadMessages() {

        try {

            const res = await api.get(`/socket/${receiver}`);

            setMessages(res.data.data);

        }
        catch (err) {
            console.log(err);
        }

    }
    useEffect(() => {

        socket.connect();

        socket.emit("join-room", conversationId);

        socket.on("receive-message", (msg) => {

            setMessages(prev => [...prev, msg]);

        });

        loadMessages();

        return () => {

            socket.off("receive-message");
            socket.disconnect();

        }

    }, []);



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

        <div className={`w-full  h-full`}   >

            <h2 className={`mt-2 ml-2`}>Messages</h2>

            <div className={`w-full h-[calc(100%-50px)] overflow-y-auto flex flex-col gap-2 p-2 pl-3`}>

                {messages.map((msg, i) => (

                    <div key={i}>
                        {msg.text}
                    </div>

                ))}

            </div>

            <div className={`flex w-full justify-items-start sm:min-h-[28px] md:min-h-[39px]  md:bottom-5 absolute bottom-3`}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type..."
                    className={`md:mx-10 mx-4   border md:w-[60%] w-[70%] border-gray-400 rounded-md px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500`}
                />

                <button onClick={sendMessage}>
                    <Send className="hover:scale-110 transition-all duration-200 ease-in-out hover:text-amber-200" />
                </button>
            </div>

        </div>

    );

}