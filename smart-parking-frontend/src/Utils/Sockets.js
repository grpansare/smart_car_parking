// socket.js
import { io } from "socket.io-client";

const socket = io("http://localhost:8081"); // your backend URL

export default socket;
