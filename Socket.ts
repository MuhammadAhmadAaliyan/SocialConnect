import { io } from "socket.io-client";

const Socket = io("https://socialconnect-backend-production.up.railway.app");

export default Socket;