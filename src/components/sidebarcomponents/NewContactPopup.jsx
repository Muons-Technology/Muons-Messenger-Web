import { useState } from "react";
import { db, auth } from "../../../backend/firebase.config";
import {
  collection,
  query,
  where,
  getDocs,
  addDoc,
  doc,
  getDoc,
} from "firebase/firestore";

const NewContactPopup = ({ onClose, addToChatList }) => {
  const [username, setUsername] = useState("");
  const [userExists, setUserExists] = useState(null);
  const [checking, setChecking] = useState(false);
  const [adding, setAdding] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheckUser = async () => {
    setChecking(true);
    setSuccessMessage("");
    setErrorMessage("");

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username.trim())
      );
      const querySnapshot = await getDocs(q);
      const currentUserId = auth.currentUser.uid;

      if (!querySnapshot.empty) {
        const foundUser = querySnapshot.docs[0];
        if (foundUser.id === currentUserId) {
          setUserExists(false);
          setErrorMessage("You cannot add yourself.");
        } else {
          setUserExists(true);
        }
      } else {
        setUserExists(false);
        setErrorMessage("User not found.");
      }
    } catch (error) {
      console.error("Error checking user:", error);
      setUserExists(false);
      setErrorMessage("Error occurred while searching.");
    } finally {
      setChecking(false);
    }
  };

  const handleAddUser = async () => {
    setAdding(true);
    setErrorMessage("");

    try {
      const q = query(
        collection(db, "users"),
        where("username", "==", username.trim())
      );
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        const receiverDoc = querySnapshot.docs[0];
        const receiverData = receiverDoc.data();
        const receiverId = receiverDoc.id;

        const senderId = auth.currentUser.uid;
        const senderRef = doc(db, "users", senderId);
        const senderSnap = await getDoc(senderRef);

        if (!senderSnap.exists()) {
          throw new Error("Sender user not found");
        }

        const senderData = senderSnap.data();

        // Store sender and receiver data clearly
        await addDoc(collection(db, "usersFriends"), {
          senderId,
          senderUsername: senderData.username,
          senderName: senderData.name || senderData.username,
          senderAvatar: senderData.avatar || "",

          receiverId,
          receiverUsername: receiverData.username,
          receiverName: receiverData.name || receiverData.username,
          receiverAvatar: receiverData.avatar || "",

          status: "pending",
          createdAt: new Date(),
        });

        setSuccessMessage("Friend request sent!");
        setUsername("");
        setUserExists(null);
      }
    } catch (error) {
      console.error("Error adding user:", error);
      setErrorMessage("Failed to send friend request.");
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className="absolute top-20 right-4 bg-gray-900 border border-gray-700 rounded-lg shadow-xl p-5 w-80 z-50 text-gray-200">
      <h2 className="text-xl font-semibold mb-4 text-white">Add New Contact</h2>

      <input
        type="text"
        value={username}
        onChange={(e) => {
          setUsername(e.target.value);
          setUserExists(null);
          setSuccessMessage("");
          setErrorMessage("");
        }}
        placeholder="Enter username"
        className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
      />

      <button
        onClick={handleCheckUser}
        className="mt-4 w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded-md font-medium transition"
        disabled={checking}
      >
        {checking ? "Checking..." : "Check Username"}
      </button>

      {userExists === true && (
        <div className="mt-4">
          <p className="text-green-400 text-sm">User found!</p>
          <button
            onClick={handleAddUser}
            className="mt-2 w-full bg-green-600 hover:bg-green-500 text-white py-2 rounded-md font-medium transition"
            disabled={adding}
          >
            {adding ? "Sending..." : "Send Friend Request"}
          </button>
        </div>
      )}

      {userExists === false && errorMessage && (
        <p className="text-red-500 text-sm mt-4">{errorMessage}</p>
      )}

      {successMessage && (
        <p className="text-green-400 text-sm mt-4">{successMessage}</p>
      )}

      <button
        onClick={onClose}
        className="mt-5 w-full text-gray-400 hover:text-white text-sm transition"
      >
        Close
      </button>
    </div>
  );
};

export default NewContactPopup;
