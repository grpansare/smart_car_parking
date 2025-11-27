// socket.js
import { io } from "socket.io-client";

const socket = io("https://smart-car-parking-wa4f.onrender.com"); // your backend URL

export default socket;
