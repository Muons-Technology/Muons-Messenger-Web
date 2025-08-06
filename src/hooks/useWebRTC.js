import { useState, useEffect, useRef, useCallback } from "react";

export function useWebRTC({ currentUserId, otherUserId, wsRef, onMessageReceived }) {
  const pcRef = useRef(null);
  const dataChannelRef = useRef(null);
  const [isConnected, setIsConnected] = useState(false);

  const iceServers = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
  };

  const sendSignal = useCallback(
    (data) => {
      if (wsRef?.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({
          type: "webrtc-signal",
          from: currentUserId,
          to: otherUserId,
          data,
        }));
      } else {
        console.warn("⚠️ WebSocket not open. Signal not sent:", data);
      }
    },
    [currentUserId, otherUserId, wsRef]
  );

  const setupDataChannel = (channel) => {
    channel.onopen = () => {
      console.log("✅ WebRTC DataChannel opened");
      setIsConnected(true);
    };
    channel.onclose = () => {
      console.warn("🔌 WebRTC DataChannel closed");
      setIsConnected(false);
    };
    channel.onerror = (error) => {
      console.error("❌ WebRTC DataChannel error:", error);
    };
    channel.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        if (data.type === "message" && data.message) {
          const id = data.id || `webrtc-${data.timestamp}-${Math.random().toString(36).slice(2, 8)}`;
          onMessageReceived(data.message, data.senderId, data.timestamp, id);
        }
      } catch (err) {
        console.error("🚫 Failed to parse incoming WebRTC message:", err);
      }
    };
  };

  const createPeerConnection = useCallback(() => {
    if (pcRef.current) return;
    const pc = new RTCPeerConnection(iceServers);

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal({ type: "ice-candidate", candidate: event.candidate });
      }
    };

    pc.ondatachannel = (event) => {
      const channel = event.channel;
      dataChannelRef.current = channel;
      setupDataChannel(channel);
    };

    pcRef.current = pc;
  }, [sendSignal]);

  const createOffer = useCallback(async () => {
    createPeerConnection();

    const pc = pcRef.current;
    const channel = pc.createDataChannel("chat");
    dataChannelRef.current = channel;
    setupDataChannel(channel);

    const offer = await pc.createOffer();
    await pc.setLocalDescription(offer);
    sendSignal({ type: "offer", sdp: offer.sdp });
  }, [createPeerConnection, sendSignal]);

  const handleSignalData = useCallback(
    async (data) => {
      createPeerConnection();
      const pc = pcRef.current;

      try {
        if (data.type === "offer") {
          await pc.setRemoteDescription(new RTCSessionDescription({ type: "offer", sdp: data.sdp }));
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          sendSignal({ type: "answer", sdp: answer.sdp });

        } else if (data.type === "answer") {
          if (pc.signalingState !== "stable") {
            await pc.setRemoteDescription(new RTCSessionDescription({ type: "answer", sdp: data.sdp }));
          }

        } else if (data.type === "ice-candidate") {
          if (data.candidate) {
            await pc.addIceCandidate(new RTCIceCandidate(data.candidate));
          }
        }
      } catch (err) {
        console.error("❌ WebRTC signal handling error:", err);
      }
    },
    [createPeerConnection, sendSignal]
  );

  useEffect(() => {
    const handleSignalEvent = (e) => {
      const { from, to, data } = e.detail;
      if (from === otherUserId && to === currentUserId) {
        handleSignalData(data);
      }
    };

    window.addEventListener("webrtc-signal", handleSignalEvent);

    return () => {
      window.removeEventListener("webrtc-signal", handleSignalEvent);
      pcRef.current?.close();
      pcRef.current = null;
      dataChannelRef.current = null;
      setIsConnected(false);
    };
  }, [currentUserId, otherUserId, handleSignalData]);

  useEffect(() => {
    const isInitiator = currentUserId < otherUserId;
    if (!isConnected && wsRef.current?.readyState === WebSocket.OPEN && isInitiator) {
      createOffer();
    }
  }, [isConnected, wsRef, currentUserId, otherUserId, createOffer]);

  const sendWebRTCMessage = (message) => {
    if (dataChannelRef.current?.readyState === "open") {
      const timestamp = Date.now();
      const msg = {
        id: `webrtc-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
        type: "message",
        senderId: currentUserId,
        message,
        timestamp,
      };
      dataChannelRef.current.send(JSON.stringify(msg));
    } else {
      console.warn("❌ WebRTC data channel not open — cannot send");
    }
  };

  return { sendWebRTCMessage, isConnected };
}
