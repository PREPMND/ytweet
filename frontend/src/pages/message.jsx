import { useEffect, useState } from "react";
import api from "../api/api";
import { socket } from "../socket";

export default function Messages({ currentId }) {

    const receiver = "6a2f87bc7070714778cb14eb";

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

            await api.post("/socket/send", {
                receiver,
                text: message,
            });

            const newMessage = {
                sender: currentId,
                receiver,
                conversationId,
                text: message,
                createdAt: new Date(),
            };

            setMessages(prev => [...prev, newMessage]);

            socket.emit("send-message", newMessage);

            setMessage("");

        }
        catch (err) {
            console.log(err);
        }

    }

    return (

        <div className={`w-full h-full`}   >

            <h2>Messages</h2>

            <div>

                {messages.map((msg, i) => (

                    <div key={i}>
                        {msg.text}
                    </div>

                ))}

            </div>

            <div classname={`flex md:bottom-4 absolute bottom-2`}>
                <input
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type..."
                />

                <button onClick={sendMessage}>
                    Send
                </button>
            </div>

        </div>

    );

}