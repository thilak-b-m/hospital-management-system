let io = null;
const userSockets = new Map();

export const setSocketServer = (server) => {
  io = server;
};

export const addUserSocket = (userId, socketId) => {
  const userKey = String(userId);
  if (!userSockets.has(userKey)) userSockets.set(userKey, new Set());
  userSockets.get(userKey).add(socketId);
};

export const removeUserSocket = (userId, socketId) => {
  const userKey = String(userId);
  const sockets = userSockets.get(userKey);
  if (!sockets) return;
  sockets.delete(socketId);
  if (sockets.size === 0) userSockets.delete(userKey);
};

export const getUserSocketIds = (userId) => {
  const userKey = String(userId);
  return userSockets.get(userKey) || new Set();
};

export const emitToUser = (userId, event, payload) => {
  if (!io) return;
  const socketIds = getUserSocketIds(userId);
  socketIds.forEach((socketId) => {
    const socket = io.sockets.sockets.get(socketId);
    if (socket) socket.emit(event, payload);
  });
};
