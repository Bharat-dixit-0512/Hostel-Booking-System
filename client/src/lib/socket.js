import { io } from "socket.io-client";

const resolveSocketUrl = () => {
  const explicitSocketUrl = import.meta.env.VITE_SOCKET_URL?.trim();

  if (explicitSocketUrl) {
    return explicitSocketUrl.replace(/\/+$/, "");
  }

  const apiUrl = import.meta.env.VITE_API_URL?.trim();

  if (!apiUrl) {
    return import.meta.env.MODE === "development"
      ? "http://localhost:5000"
      : undefined;
  }

  const trimmedApiUrl = apiUrl.replace(/\/+$/, "");
  const startsWithHttp =
    trimmedApiUrl.startsWith("http://") || trimmedApiUrl.startsWith("https://");

  if (!startsWithHttp) {
    return undefined;
  }

  return trimmedApiUrl.endsWith("/api")
    ? trimmedApiUrl.slice(0, -4)
    : trimmedApiUrl;
};

const socket = io(resolveSocketUrl(), {
  autoConnect: false,
  transports: ["websocket", "polling"],
  withCredentials: true,
});

export default socket;
