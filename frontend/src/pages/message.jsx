import { useEffect } from "react";
import { socket } from "../socket";
export default function Messages() {
    const roomId = "fwrge"
    useEffect(() => {
        socket.connect();
        socket.on("connect", () => {

        });
        socket.emit("join-room", roomId);
        socket.emit("send-message", roomId, "hey hello")
        socket.on("receive-message", (message) => {
            console.log(message);
        });
    }, []);
    return (
        <>
            <div className=" flex justify center mt-10 mb-10">
                <input type="text" className="m-auto bg-black text-white h-11 " />
            </div>
            <div className="text-center">
                IHWGEUH
            </div>
        </>
    )
}