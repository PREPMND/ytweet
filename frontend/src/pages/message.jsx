import { useEffect } from "react";
import { socket } from "../socket";

const roomId = "fwrge";

export default function Messages() {

    useEffect(() => {
        socket.connect();

        socket.on("connect", () => {
            console.log(socket.id);

            socket.emit("join-room", roomId);
        });

        socket.on("receive-message", (message) => {
            console.log("Received:", message);
        });

        return () => {
            socket.off("receive-message");
            socket.off("connect");
            socket.disconnect();
        };
    }, []);

    const sendMessage = () => {
        socket.emit("send-message", {
            roomId,
            message: "Hello from React",
        });
    };

    return (
        <button onClick={sendMessage}>
            Send
        </button>
    );
}