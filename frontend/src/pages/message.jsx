import { useEffect, useState } from "react";
import api from "../api";
import { socket } from "../socket";

export default function Messages() {

    // TODO: Replace with actual logged-in user
    const receiver = "RECEIVER_USER_ID";

    const [messages, setMessages] = useState([]);
    const [message, setMessage] = useState("");

    // Backend generates the same conversationId
    const conversationId = ["CURRENT_USER_ID", receiver]
        .sort()
        .join("_");

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

    async function loadMessages() {

        try {

            const res = await api.get(`/messages/${receiver}`);

            setMessages(res.data.data);

        }
        catch (err) {
            console.log(err);
        }

    }

    async function sendMessage() {

        if (!message.trim()) return;

        try {

            await api.post("/messages/send", {
                receiver,
                text: message,
            });

            const newMessage = {
                sender: "CURRENT_USER_ID",
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

        <div>

            <h2>Messages</h2>

            <div>

                {messages.map((msg, i) => (

                    <div key={i}>
                        {msg.text}
                    </div>

                ))}

            </div>

            <input
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Type..."
            />

            <button onClick={sendMessage}>
                Send
            </button>

        </div>

    );

}