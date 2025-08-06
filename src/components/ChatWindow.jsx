import { useState, useRef, useEffect } from "react";
import { db, auth } from "../../backend/firebase.config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";

import ChatInput from "./chatcomponents/chatinput/ChatInput";
import ChatWindowHeader from "../components/chatcomponents/chatwindowcomponents/ChatWindowHeader";
import ChatProfileSidebar from "../components/chatcomponents/chatwindowcomponents/windowheadersidebar/ChatProfileSidebar";
import muons from "../assets/images/background.png";

import { useWebSocket } from "../hooks/useWebSocket";
import { useLocalMessages } from "../hooks/useLocalMessages";
import { useOtherUser } from "../hooks/useOtherUser";
import { useFirestoreMessages } from "../hooks/useFirestoreMessages";
import { useMarkMessagesAsRead } from "../hooks/useMarkMessagesAsRead";
import { useWebRTC } from "../hooks/useWebRTC";
import { useNetworkStatus } from "../hooks/useNetworkStatus";
import { useSyncQueuedMessages } from "../hooks/useSyncQueuedMessages";

import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

const ChatWindow = ({ chat, onBack }) => {
  const [messages, setMessages] = useState([]);
  const [otherUser, setOtherUser] = useState(null);
  const [lastSeen, setLastSeen] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [loadingLocalMessages, setLoadingLocalMessages] = useState(true);

  const currentUser = auth.currentUser;
  const messagesEndRef = useRef(null);
  const participants = chat?.participants || [];

  const combinedChatId =
    currentUser && chat ? [currentUser.uid, chat.id].sort().join("_") : null;

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    });
  };

  const {
    wsRef,
    isConnected: isWSConnected,
    isRegistered,
    serverIp,
  } = useWebSocket(
    currentUser,
    combinedChatId,
    participants,
    messages,
    setMessages,
    scrollToBottom
  );

  useOtherUser(participants, currentUser, setOtherUser, setLastSeen);
  useLocalMessages(combinedChatId, setMessages, setLoadingLocalMessages);
  useFirestoreMessages(combinedChatId, setMessages, scrollToBottom);
  useMarkMessagesAsRead(combinedChatId, currentUser);
  useSyncQueuedMessages(combinedChatId);

  const { sendWebRTCMessage, isConnected: isWebRTCConnected } = useWebRTC({
    currentUserId: currentUser?.uid,
    otherUserId: chat?.id,
    wsRef,
    onMessageReceived: (message, senderId, timestamp, id) => {
      const newMsg = {
        senderId,
        message,
        timestamp: new Date(timestamp),
        id: id || `webrtc-${timestamp}-${Math.random().toString(36).slice(2, 8)}`,
      };
      setMessages((prev) => {
        const exists = prev.some((msg) => msg.id === newMsg.id);
        return exists ? prev : [...prev, newMsg];
      });
      scrollToBottom();
    },
  });

  const { isOnline } = useNetworkStatus();

  useEffect(() => {
    if (isOnline !== null) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: isOnline ? "success" : "error",
        title: isOnline ? "You are online" : "You are offline",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }, [isOnline]);

  useEffect(() => {
    if (isWSConnected && serverIp) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Connected to Host",
        text: `Host IP: ${serverIp}`,
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }, [isWSConnected, serverIp]);

  useEffect(() => {
    if (isRegistered) {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "info",
        title: "✅ Registered on Muons Server",
        showConfirmButton: false,
        timer: 2000,
      });
    }
  }, [isRegistered]);

  const sendMessage = async (text) => {
    const msg = text.trim();
    if (!msg || !currentUser?.uid || !combinedChatId) return;

    const timestamp = new Date();
    const msgId = `msg-${timestamp.getTime()}-${Math.random().toString(36).slice(2, 6)}`;

    const newMessage = {
      id: msgId,
      senderId: currentUser.uid,
      message: msg,
      timestamp,
      read: false,
      combinedChatId,
    };

    // Show in UI
    setMessages((prev) => [...prev, newMessage]);
    scrollToBottom();

    try {
      // Save to Firestore
      await addDoc(collection(db, "chats", combinedChatId, "messages"), {
        ...newMessage,
        timestamp: serverTimestamp(),
      });

      await updateDoc(doc(db, "chats", combinedChatId), {
        lastMessage: {
          text: msg,
          senderId: currentUser.uid,
          timestamp: serverTimestamp(),
          read: false,
        },
      });
    } catch (error) {
      console.warn("⚠️ Firestore save failed:", error);
    }

    // WebSocket Send
    const recipientId =
      otherUser?.uid || participants.find((id) => id !== currentUser.uid) || chat?.id;

    if (isWebRTCConnected) {
      sendWebRTCMessage(msg);
    } else if (wsRef.current?.readyState === WebSocket.OPEN && recipientId) {
      const payload = {
        type: "message",
        to: recipientId,
        from: currentUser.uid,
        message: msg,
        timestamp: timestamp.getTime(),
      };

      console.log("📤 Sending payload via WebSocket:", payload);
      wsRef.current.send(JSON.stringify(payload));
    } else {
      console.warn("❌ WebSocket not open or recipientId missing:", {
        readyState: wsRef.current?.readyState,
        recipientId,
      });
    }
  };

  if (loadingLocalMessages && messages.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center text-white">
        Loading messages...
      </div>
    );
  }

  const uniqueMessages = Array.from(
    new Map(messages.map((m) => [m.id, m])).values()
  );

  return (
    <div className="flex-1 h-screen flex flex-col bg-gray-900 text-white">
      <ChatWindowHeader
        chat={chat}
        onBack={onBack}
        otherUser={otherUser}
        lastSeen={lastSeen}
        onProfileClick={() => setSidebarOpen(true)}
      />

      <div
        className="flex-1 overflow-y-auto px-4 py-4 space-y-4"
        style={{ background: `url(${muons}) center/cover no-repeat` }}
      >
        {uniqueMessages.map((msg) => {
          const date =
            msg.timestamp instanceof Date
              ? msg.timestamp
              : msg.timestamp?.toDate?.() || new Date(msg.timestamp);
          const isSender = msg.senderId === currentUser?.uid;
          const readStatus = isSender ? (
            msg.read ? (
              <span className="ml-1 text-blue-400">✓✓</span>
            ) : (
              <span className="ml-1 text-gray-400">✓</span>
            )
          ) : null;

          return (
            <div key={msg.id}>
              <div className={`flex ${isSender ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[60%] px-4 py-2 rounded-lg break-words ${
                    isSender
                      ? "bg-blue-600 rounded-br-none"
                      : "bg-gray-700 rounded-bl-none"
                  }`}
                >
                  <div className="flex items-end space-x-2">
                    <span>{msg.message}</span>
                    {readStatus}
                  </div>
                  <div className="text-xs text-gray-300 text-right">
                    {date.toLocaleTimeString(undefined, {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      <ChatInput sendMessage={sendMessage} />

      <ChatProfileSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        otherUser={otherUser}
        lastSeen={lastSeen}
      />
    </div>
  );
};

export default ChatWindow;
