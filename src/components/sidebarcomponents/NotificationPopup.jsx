import React, { useEffect, useState } from "react";
import { db, auth } from "../../../backend/firebase.config";
import {
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  setDoc,
  getDoc,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

const NotificationPopup = ({ onAccept, onDecline }) => {
  const [requests, setRequests] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  // Track logged-in user ID
  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUserId(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  // Fetch pending friend requests
  useEffect(() => {
    if (!currentUserId) return;

    const q = query(
      collection(db, "usersFriends"),
      where("receiverId", "==", currentUserId),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setRequests(data);
    });

    return () => unsubscribe();
  }, [currentUserId]);

  // Accept friend request
  const handleAcceptRequest = async (request) => {
    try {
      const requestRef = doc(db, "usersFriends", request.id);
      const { senderId, receiverId } = request;

      if (!senderId || !receiverId) throw new Error("Invalid user IDs");

      const participants = [senderId, receiverId].sort();
      const chatId = participants.join("_");
      const chatRef = doc(db, "chats", chatId);
      const chatSnap = await getDoc(chatRef);

      // Ensure chat exists
      if (!chatSnap.exists()) {
        await setDoc(chatRef, {
          participants,
          createdAt: serverTimestamp(),
          lastMessage: null,
        });
        console.log("Chat created:", chatId);
      }

      // Update original request
      await updateDoc(requestRef, {
        status: "accepted",
        chatId,
      });

      // Fetch sender and receiver profiles
      const [senderSnap, receiverSnap] = await Promise.all([
        getDoc(doc(db, "users", senderId)),
        getDoc(doc(db, "users", receiverId)),
      ]);

      const senderData = senderSnap.data() || {};
      const receiverData = receiverSnap.data() || {};

      // Add mirrored friend doc
      await addDoc(collection(db, "usersFriends"), {
        senderId: receiverId,
        senderUsername: receiverData.username || "",
        senderName: receiverData.name || receiverData.username || "",
        senderAvatar: receiverData.avatar || "",

        receiverId: senderId,
        receiverUsername: senderData.username || "",
        receiverName: senderData.name || senderData.username || "",
        receiverAvatar: senderData.avatar || "",

        status: "accepted",
        chatId,
        createdAt: serverTimestamp(),
      });

      onAccept?.(request);
    } catch (err) {
      console.error("Error accepting friend request:", err);
      alert("Failed to accept friend request.");
    }
  };

  // Decline friend request
  const handleDeclineRequest = async (request) => {
    try {
      await updateDoc(doc(db, "usersFriends", request.id), {
        status: "declined",
      });
      onDecline?.(request);
    } catch (err) {
      console.error("Error declining friend request:", err);
      alert("Failed to decline friend request.");
    }
  };

  if (!currentUserId) return null;

  return (
    <div className="absolute right-4 top-16 bg-gray-800 border border-gray-700 rounded-lg shadow-lg w-80 z-50">
      <div className="p-4 border-b border-gray-600 text-gray-300 font-semibold">
        Friend Requests
      </div>
      <div className="max-h-64 overflow-y-auto">
        {requests.length === 0 ? (
          <p className="text-gray-400 text-sm p-4">No pending requests</p>
        ) : (
          requests.map((request) => (
            <div
              key={request.id}
              className="flex items-center justify-between px-4 py-3 hover:bg-gray-700 transition"
            >
              <div className="text-gray-200 font-medium">
                {request.senderUsername || "Unknown User"}
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => handleAcceptRequest(request)}
                  className="px-2 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-500"
                >
                  Accept
                </button>
                <button
                  onClick={() => handleDeclineRequest(request)}
                  className="px-2 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-500"
                >
                  Decline
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationPopup;
