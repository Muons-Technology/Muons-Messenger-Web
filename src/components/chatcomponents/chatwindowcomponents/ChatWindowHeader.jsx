import { useEffect, useState } from "react";
import { FaArrowLeft, FaVideo, FaPhoneAlt, FaSearch } from "react-icons/fa";
import { formatDistanceToNow, parseISO } from "date-fns";
import { doc, onSnapshot } from "firebase/firestore";
import { db } from "../../../../backend/firebase.config"; // Adjust the path

const ChatWindowHeader = ({ chat, onBack, onProfileClick }) => {
  const [lastSeen, setLastSeen] = useState(null);
  const [isOnline, setIsOnline] = useState(false);

  useEffect(() => {
    if (!chat?.id) return;

    const userDocRef = doc(db, "users", chat.id);

    // Subscribe to real-time updates on user document
    const unsubscribe = onSnapshot(
      userDocRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();

          // Assume the user document has an 'isOnline' boolean field or a 'status' string
          setIsOnline(data.isOnline === true || data.status === "Online");

          if (data.lastSeen) {
            setLastSeen(data.lastSeen);
          } else {
            setLastSeen(null);
          }
        } else {
          setIsOnline(false);
          setLastSeen(null);
        }
      },
      (error) => {
        console.error("Error listening to user status:", error);
        setIsOnline(false);
        setLastSeen(null);
      }
    );

    // Cleanup on unmount or chat.id change
    return () => unsubscribe();
  }, [chat?.id]);

  const renderStatus = () => {
    if (isOnline) return "Online";

    if (lastSeen) {
      try {
        let lastSeenDate;
        if (lastSeen.toDate) {
          // Firestore Timestamp object
          lastSeenDate = lastSeen.toDate();
        } else if (typeof lastSeen === "string") {
          lastSeenDate = parseISO(lastSeen);
        } else {
          lastSeenDate = lastSeen;
        }
        return `Last seen ${formatDistanceToNow(lastSeenDate, { addSuffix: true })}`;
      } catch (e) {
        return "Offline";
      }
    }
    return "Offline";
  };

  return (
    <div className="sticky top-0 z-10 px-4 py-3 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 backdrop-blur-md border-b border-gray-700 shadow-md">
      <div className="flex items-center justify-between gap-3">

        {/* Left: Back button (mobile only) and clickable Avatar/Name/Status */}
        <div
          className="flex items-center gap-3 flex-shrink-0 cursor-pointer"
          onClick={onProfileClick}
        >
          {/* Back button for mobile */}
          <button onClick={onBack} className="text-white text-xl sm:hidden">
            <FaArrowLeft />
          </button>

          {/* Avatar */}
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-gray-600 shadow-md">
            {chat.avatar ? (
              <img
                src={chat.avatar}
                alt="avatar"
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-600 flex items-center justify-center text-white text-sm font-semibold">
                {chat.name?.[0] || "U"}
              </div>
            )}
            {/* Online Indicator */}
            {isOnline && (
              <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-green-500 border-2 border-gray-900"></span>
            )}
          </div>

          {/* Name + Status */}
          <div className="flex flex-col text-white">
            <span className="font-semibold text-sm sm:text-base truncate max-w-[120px] sm:max-w-[200px]">
              {chat.name}
            </span>
            <span style={{fontSize: "10.8px"}} className="text-xs text-gray-300">{renderStatus()}</span>
          </div>
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-4 text-white text-lg">
          <button
            title="Video"
            className="hover:text-indigo-400 transition duration-200"
          >
            <FaVideo />
          </button>
          <button
            title="Voice Call"
            className="hover:text-indigo-400 transition duration-200"
          >
            <FaPhoneAlt />
          </button>
          <button
            title="Search"
            className="hover:text-indigo-400 transition duration-200"
          >
            <FaSearch />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatWindowHeader;
