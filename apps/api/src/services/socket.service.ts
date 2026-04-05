import type { Server as HttpServer } from "node:http";
import { Server } from "socket.io";
import type { Socket } from "socket.io";
import { getAllowedOrigins } from "../lib/origins.js";
import { verifyToken } from "../utils/jwt.js";

let io: Server | null = null;

export function createSocketServer(server: HttpServer) {
  const allowedOrigins = getAllowedOrigins();

  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true
    }
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token as string | undefined;

      if (!token) {
        return next();
      }

      socket.data.user = verifyToken(token);
      return next();
    } catch (error) {
      return next(error as Error);
    }
  });

  io.on("connection", (socket: Socket) => {
    const user = socket.data.user;

    if (user?.sub) {
      socket.join(`user:${user.sub}`);
    }

    socket.on("chat:join", (bookingId: string) => {
      socket.join(`booking:${bookingId}`);
    });

    socket.on("chat:typing", (payload: { bookingId: string; userId: string; typing: boolean }) => {
      socket.to(`booking:${payload.bookingId}`).emit("chat:typing", payload);
    });

    socket.on("video:join", (bookingId: string) => {
      socket.join(`video:${bookingId}`);
    });

    socket.on("video:signal", (payload: { bookingId: string; signal: unknown; senderId: string }) => {
      socket.to(`video:${payload.bookingId}`).emit("video:signal", payload);
    });
  });

  return io;
}

export function getIO() {
  if (!io) {
    throw new Error("Socket.io has not been initialized yet");
  }

  return io;
}

export function emitToUser(userId: string, event: string, payload: unknown) {
  if (!io) {
    return;
  }

  io.to(`user:${userId}`).emit(event, payload);
}

export function emitToBookingRoom(bookingId: string, event: string, payload: unknown) {
  if (!io) {
    return;
  }

  io.to(`booking:${bookingId}`).emit(event, payload);
}
