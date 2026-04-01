import { io, type Socket } from "socket.io-client";
import { SOCKET_URL } from "./config";

let socketInstance: Socket | null = null;

export function getSocket(token?: string | null) {
  if (!socketInstance) {
    socketInstance = io(SOCKET_URL, {
      autoConnect: false,
      transports: ["websocket"]
    });
  }

  if (token) {
    socketInstance.auth = { token };
  }

  if (!socketInstance.connected) {
    socketInstance.connect();
  }

  return socketInstance;
}
