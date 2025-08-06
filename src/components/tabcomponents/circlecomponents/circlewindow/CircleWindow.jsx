import { useState, useRef, useEffect } from "react";
import { auth, db } from "../../../../../backend/firebase.config";
import {
  addDoc,
  collection,
  serverTimestamp,
  onSnapshot,
  query,
  orderBy,
  where,
} from "firebase/firestore";

// Background image
import muons from "../../../../assets/images/background.png";

// Components
import CircleHeader from "../circleheader/CircleHeader";
import CircleInput from "./CircleInput";

const CircleWindow = ({ circle, onClose }) => {
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  const currentUser = auth.currentUser;

  // Scroll to the bottom of the chat
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  // Listen for messages in this circle from circleChats collection
  useEffect(() => {
    if (!circle?.id) return;

    const chatsRef = collection(db, "circlesChats");
    const q = query(
      chatsRef,
      where("circleId", "==", circle.id),
      orderBy("timestamp")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMessages(msgs);
      scrollToBottom();
    });

    return () => unsubscribe();
  }, [circle?.id]);

  // Send a message
 const sendMessage = async (msg) => {
  if (!msg || !currentUser || !circle?.id) return;

  // Create a local message with a temporary ID and current time
  const tempId = Date.now().toString();
  const localMessage = {
    id: tempId,
    circleId: circle.id,
    senderId: currentUser.uid,
    message: msg,
    timestamp: new Date(), // For temporary UI display
    pending: true,         // Optional: flag it as not yet confirmed
  };

  // Optimistically add to messages state
  setMessages((prev) => [...prev, localMessage]);

  // Send to Firestore
  await addDoc(collection(db, "circlesChats"), {
    circleId: circle.id,
    senderId: currentUser.uid,
    message: msg,
    timestamp: serverTimestamp(),
  });
};

  return (
    <div className="flex-1 h-screen flex flex-col bg-gray-900 text-white">
      {/* Header */}
      <CircleHeader circle={circle} onClose={onClose} />

      {/* Message list */}
      <div
        className="flex-1 overflow-y-auto p-4 space-y-3"
        style={{
          backgroundImage: `url(${muons})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        {messages.map((msg) => {
          const isSender = msg.senderId === currentUser?.uid;
          const time =
            msg.timestamp?.toDate?.().toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            }) || "--:--";

          return (
            <div
              key={msg.id}
              className={`flex ${isSender ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[70%] px-4 py-2 rounded-lg text-sm break-words ${
                  isSender
                    ? "bg-[#005c4b] text-white rounded-br-none"
                    : "bg-[#2a3942] text-gray-200 rounded-bl-none"
                }`}
              >
                <div>{msg.message}</div>
                <div className="text-[10px] text-gray-400 text-right mt-1">
                  {time}
                </div>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input box */}
      <CircleInput onSend={sendMessage} />
    </div>
  );
};

export default CircleWindow;
