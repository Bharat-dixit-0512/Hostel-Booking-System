import { Server } from "socket.io";

let io = null;

const getAllowedOrigins = () =>
  (
    process.env.CORS_ORIGIN ||
    process.env.CLIENT_URL ||
    "http://localhost:3000,http://localhost:5173"
  )
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

const isOriginAllowed = (origin, allowedOrigins) =>
  !origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin);

export const initializeSocketServer = (httpServer) => {
  if (io) {
    return io;
  }

  const allowedOrigins = getAllowedOrigins();

  io = new Server(httpServer, {
    cors: {
      origin(origin, callback) {
        if (isOriginAllowed(origin, allowedOrigins)) {
          return callback(null, true);
        }

        return callback(new Error("CORS origin not allowed"));
      },
      credentials: true,
      methods: ["GET", "POST"],
      allowedHeaders: ["Content-Type", "Authorization"],
    },
  });

  return io;
};

export const getSocketServer = () => io;

export const emitRealtimeEvent = (eventName, payload = {}) => {
  if (!io) {
    return false;
  }

  io.emit(eventName, {
    ...payload,
    emitted_at: new Date().toISOString(),
  });

  return true;
};
