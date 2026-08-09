import { io } from "socket.io-client";

let socket = null;
let currentToken = null;

export function connectSocket(token) {
  // If same token and still connected, reuse
  if (socket?.connected && currentToken === token) return socket;

  // Disconnect any existing socket (different user or disconnected)
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
  }

  currentToken = token;
  socket = io("http://localhost:5000", {
    auth: { token },
    transports: ["websocket"],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });

  return socket;
}

export function getSocket() {
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.removeAllListeners();
    socket.disconnect();
    socket = null;
    currentToken = null;
  }
}
