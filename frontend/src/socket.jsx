import { io } from "socket.io-client";

export const socket = io(import.meta.env.VITE_SOCKET_BACKEND,{
    autoConnect:false,
    transports: ["websocket"],
    withCredentials: true,
});