import { io } from "socket.io-client";

export const socket = io("https://socketconn-ebp8.onrender.com",{
    autoConnect:false,
    transports: ["websocket"],
    withCredentials: true,
});