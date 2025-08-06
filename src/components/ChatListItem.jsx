import { useState, useRef, useEffect } from "react";
import { db, auth } from "../../backend/firebase.config";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
} from "firebase/firestore";

const ChatListItem = ({
  chat,
  setSelectedChat,
  collapsed,
  removeFromChatList,
  avatar,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [lastMessage, setLastMessage] = useState("Start a conversation");
  const [lastTime, setLastTime] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);

  const currentUser = auth.currentUser;
  const menuRef = useRef();

  const combinedChatId =
    currentUser && chat?.id
      ? [currentUser.uid, chat.id].sort().join("_")
      : null;

  useEffect(() => {
    if (!combinedChatId) return;

    const messagesRef = collection(db, "chats", combinedChatId, "messages");

    const lastMsgQuery = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
    const unsubLast = onSnapshot(lastMsgQuery, (snapshot) => {
      if (!snapshot.empty) {
        const msg = snapshot.docs[0].data();
        setLastMessage(msg.message || "Media sent");

        if (msg.timestamp?.toDate) {
          const time = msg.timestamp.toDate().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          setLastTime(time);
        } else {
          setLastTime("Now");
        }
      }
    });

    const unsubUnread = onSnapshot(messagesRef, (snapshot) => {
      const unreadMsgs = snapshot.docs.filter(
        (doc) =>
          doc.data().senderId !== currentUser.uid && doc.data().read === false
      );
      setUnreadCount(unreadMsgs.length);
    });

    return () => {
      unsubLast();
      unsubUnread();
    };
  }, [combinedChatId]);

  const handleClick = () => {
    const fullChat = {
      ...chat,
      participants: [currentUser.uid, chat.id], // ✅ Inject participants
    };
    console.log("💬 Selecting chat with participants:", fullChat.participants);
    setSelectedChat(fullChat);
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setShowMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative">
      <div
        className="flex items-center p-3 hover:bg-gray-800 cursor-pointer border-b border-gray-700 transition-all"
        onClick={handleClick}
      >
        {/* Avatar */}
        <div className="w-10 h-10 rounded-full flex items-center justify-center bg-gray-600 mr-4">
          {avatar}
        </div>

        {/* Chat details */}
        {!collapsed && (
          <div className="flex-1">
            <div className="flex justify-between items-center">
              <h4 className="font-semibold text-white truncate">{chat.name}</h4>
              <span className="text-xs text-gray-400">{lastTime}</span>
            </div>
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-400 truncate max-w-[85%]">
                {lastMessage}
              </p>
              {unreadCount > 0 && (
                <span className="ml-2 bg-green-500 text-white text-xs rounded-full px-2 py-0.5 shrink-0">
                  {unreadCount}
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatListItem;
