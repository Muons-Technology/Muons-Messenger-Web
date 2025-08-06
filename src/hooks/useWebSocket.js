import { useEffect, useRef, useState } from "react";
import { saveMessages } from "../utils/indexedDB";
import Swal from "sweetalert2";

// Helper: Determine which WebSocket URL to use
const getWebSocketURL = () => {
  const mode = localStorage.getItem("ws_mode");
  const ip = localStorage.getItem("ws_ip");

  if (mode === "host") return "ws://localhost:5050";
  if (mode === "join" && ip) return `ws://${ip}:5050`;

  const isLocalhost = window.location.hostname === "localhost";
  return isLocalhost ? "ws://localhost:5050" : "wss://43e7-102-89-22-211.ngrok-free.app";
};

export const useWebSocket = (
  currentUser,
  combinedChatId,
  participants,
  setMessages,
  scrollToBottom
) => {
  const wsRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [serverIp, setServerIp] = useState(null);
  const [pingStatus, setPingStatus] = useState(null);
  const participantsRef = useRef(participants);
  const retryTimeout = useRef(null);

  // Keep participants ref updated
  useEffect(() => {
    participantsRef.current = participants;
  }, [participants]);

  useEffect(() => {
    if (!currentUser || !combinedChatId || participants.length === 0) {
      console.warn("🚫 WebSocket setup skipped: missing data");
      return;
    }

    const WS_URL = getWebSocketURL();
    const ip = localStorage.getItem("ws_ip") || "localhost";
    const mode = localStorage.getItem("ws_mode");
    setServerIp(ip);

    const attemptConnection = () => {
      console.log("🌍 WebSocket mode:", mode, "| IP:", ip, "| WS URL:", WS_URL);

      // ✅ If in local mode (host or join), skip ping check
      if (mode === "host" || mode === "join") {
        setPingStatus("bypassed");
        connectWebSocket();
        return;
      }

      // Otherwise: try ping first
      const pingUrl = `http://${ip}:5050/ping?ip=${ip}`;
      console.log("🔃 Pinging server at:", pingUrl);

      fetch(pingUrl)
        .then((res) => res.json())
        .then((data) => {
          if (!data.success) throw new Error("Ping failed");
          setPingStatus("reachable");

          Swal.fire({
            toast: true,
            icon: "success",
            title: `🟢 Host reachable at ${ip}`,
            timer: 2000,
            showConfirmButton: false,
            position: "top-end",
          });

          connectWebSocket();
        })
        .catch(() => {
          setPingStatus("unreachable");
          Swal.fire({
            toast: true,
            icon: "error",
            title: `❌ Cannot reach server at ${ip}`,
            text: "Ensure the host server is running and you're connected to the hotspot.",
            timer: 3000,
            showConfirmButton: false,
            position: "top-end",
          });

          retryTimeout.current = setTimeout(attemptConnection, 5000);
        });
    };

    const connectWebSocket = () => {
      if (wsRef.current && wsRef.current.readyState <= 1) {
        console.warn("⚠️ WebSocket already open or connecting");
        return;
      }

      console.log("🧪 Attempting WebSocket connection to:", WS_URL);
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => {
        console.log("✅ WebSocket connected:", WS_URL);
        setIsConnected(true);

        const registerPayload = JSON.stringify({ type: "register", userId: currentUser.uid });
        console.log("📤 Registering on server with payload:", registerPayload);
        ws.send(registerPayload);
      };

      ws.onmessage = (event) => {
        console.log("📨 Received WS message:", event.data);
        try {
          const data = JSON.parse(event.data);

          if (data.type === "registered") {
            setIsRegistered(true);
            const evt = new CustomEvent("user-registered", {
              detail: { userId: data.userId, ip },
            });
            window._lastUserRegisteredEvent = evt;
            window.dispatchEvent(evt);
            return;
          }

          if (
            data.type === "message" &&
            data.to === currentUser.uid &&
            data.from !== currentUser.uid &&
            participantsRef.current.includes(data.from)
          ) {
            const incomingMsg = {
              id: `ws-${Date.now()}`,
              senderId: data.from,
              message: data.message,
              timestamp: new Date(data.timestamp),
              read: false,
              combinedChatId,
            };

            console.log("💬 Incoming WS message:", incomingMsg);

            setMessages((prev) => {
              const alreadyExists = prev.some((m) => m.id === incomingMsg.id);
              if (alreadyExists) return prev;

              const updated = [...prev, incomingMsg];
              saveMessages(combinedChatId, updated).catch(console.error);
              return updated;
            });

            scrollToBottom?.();
          }
        } catch (err) {
          console.error("❌ Failed to parse WS message:", err);
        }
      };

      ws.onerror = (err) => {
        console.error("🔥 WebSocket error:", err);
      };

      ws.onclose = () => {
        console.warn("📴 WebSocket disconnected");
        setIsConnected(false);
        setIsRegistered(false);
        retryTimeout.current = setTimeout(attemptConnection, 5000);
      };
    };

    attemptConnection();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
      clearTimeout(retryTimeout.current);
    };
  }, [currentUser?.uid, combinedChatId]);

  return {
    wsRef,
    isConnected,
    isRegistered,
    serverIp,
    pingStatus,
  };
};
