"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { io, type Socket } from "socket.io-client";

export function useSocket(token: string | null) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const socketRef = useRef<Socket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cleanup = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
      socketRef.current = null;
    }
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    setSocket(null);
    setConnected(false);
  }, []);

  useEffect(() => {
    if (!token) {
      cleanup();
      return;
    }

    // Create socket connection
    const newSocket = io(
      process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:3000",
      {
        auth: { token },
        transports: ["polling"],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
        timeout: 20000,
        forceNew: true,
      }
    );

    newSocket.on("connect", () => {
      console.log("Connected to server");
      setConnected(true);
      setError(null);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("Disconnected from server:", reason);
      setConnected(false);

      // Auto-reconnect on certain disconnect reasons
      if (reason === "io server disconnect") {
        // Server initiated disconnect, don't reconnect
        setError("Server disconnected");
      } else {
        // Client or network issue, attempt reconnect
        reconnectTimeoutRef.current = setTimeout(() => {
          if (token) {
            newSocket.connect();
          }
        }, 3000);
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("Connection error:", error);
      setConnected(false);
      setError(error.message || "Connection failed");
    });

    socketRef.current = newSocket;
    setSocket(newSocket);

    return cleanup;
  }, [token, cleanup]);

  return { socket, connected, error };
}
