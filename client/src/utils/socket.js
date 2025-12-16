import { io } from 'socket.io-client';

let socket;

export function getSocket() {
  if (!socket) {
    const url = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    socket = io(url, {
      transports: ['websocket'],
    });
  }
  return socket;
}
