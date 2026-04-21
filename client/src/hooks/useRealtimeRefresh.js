import { useEffect, useRef } from "react";

import socket from "../lib/socket";

let activeSubscribers = 0;

const connectIfNeeded = () => {
  if (!socket.connected) {
    socket.connect();
  }
};

const disconnectIfIdle = () => {
  if (activeSubscribers === 0 && socket.connected) {
    socket.disconnect();
  }
};

export const useRealtimeRefresh = ({
  enabled = true,
  events = [],
  onRefresh,
  debounceMs = 200,
}) => {
  const refreshRef = useRef(onRefresh);
  const timeoutRef = useRef(null);

  useEffect(() => {
    refreshRef.current = onRefresh;
  }, [onRefresh]);

  useEffect(() => {
    const normalizedEvents = [...new Set(events)];

    if (
      !enabled ||
      typeof refreshRef.current !== "function" ||
      normalizedEvents.length === 0
    ) {
      return undefined;
    }

    const handleRealtimeEvent = () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        timeoutRef.current = null;
        refreshRef.current?.();
      }, debounceMs);
    };

    activeSubscribers += 1;
    connectIfNeeded();

    normalizedEvents.forEach((eventName) => {
      socket.on(eventName, handleRealtimeEvent);
    });

    return () => {
      normalizedEvents.forEach((eventName) => {
        socket.off(eventName, handleRealtimeEvent);
      });

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }

      activeSubscribers = Math.max(0, activeSubscribers - 1);
      disconnectIfIdle();
    };
  }, [debounceMs, enabled, events]);
};
