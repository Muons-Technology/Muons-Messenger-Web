import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../backend/firebase.config";
import ChatListItem from "./ChatListItem";
import { FaUserCircle } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";

const ChatList = ({ setSelectedChat, collapsed }) => {
  const [friends, setFriends] = useState([]);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        setFriends([]);
        return;
      }

      try {
        // Query for friend documents where user is sender and status accepted
        const senderQuery = query(
          collection(db, "usersFriends"),
          where("senderId", "==", user.uid),
          where("status", "==", "accepted")
        );

        // Query for friend documents where user is receiver and status accepted
        const receiverQuery = query(
          collection(db, "usersFriends"),
          where("receiverId", "==", user.uid),
          where("status", "==", "accepted")
        );

        // Execute both queries in parallel
        const [senderSnap, receiverSnap] = await Promise.all([
          getDocs(senderQuery),
          getDocs(receiverQuery),
        ]);

        // Map sender friends
        const senderFriends = senderSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.receiverId,
            username: data.receiverUsername,
            name: data.receiverName || data.receiverUsername,
            avatar: data.receiverAvatar || "",
            lastMessage: "Start a conversation",
            time: "",
            status: data.status,
          };
        });

        // Map receiver friends
        const receiverFriends = receiverSnap.docs.map((doc) => {
          const data = doc.data();
          return {
            id: data.senderId,
            username: data.senderUsername,
            name: data.senderName || data.senderUsername,
            avatar: data.senderAvatar || "",
            lastMessage: "Start a conversation",
            time: "",
            status: data.status,
          };
        });

        // Combine and deduplicate
        const allFriends = [...senderFriends, ...receiverFriends];
        const uniqueFriendsMap = new Map();
        allFriends.forEach((friend) => {
          if (!uniqueFriendsMap.has(friend.id)) {
            uniqueFriendsMap.set(friend.id, friend);
          }
        });

        const uniqueFriends = Array.from(uniqueFriendsMap.values());
        setFriends(uniqueFriends);
      } catch (err) {
        if (err.code === 'permission-denied') {
          console.error("Permission denied: Check your Firestore rules.");
        } else if (err.code === 'failed-precondition') {
          console.error("Missing Firestore composite index: Create indexes in Firebase console.");
        } else {
          console.error("Failed to fetch friends:", err);
        }
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const removeFromChatList = (idToRemove) => {
    setFriends((prev) => prev.filter((f) => f.id !== idToRemove));
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {friends.length === 0 ? (
        <p className="text-gray-400 text-center">No friends to show</p>
      ) : (
        friends.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            setSelectedChat={setSelectedChat}
            collapsed={collapsed}
            removeFromChatList={removeFromChatList}
            avatar={
              chat.status === "pending" ? (
                <MdPendingActions
                  className="text-yellow-400 text-2xl"
                  title="Pending request"
                />
              ) : (
                <FaUserCircle className="text-3xl text-white" />
              )
            }
          />
        ))
      )}
    </div>
  );
};

export default ChatList;
