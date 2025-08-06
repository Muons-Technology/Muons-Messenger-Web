import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FiEdit,
  FiSettings,
  FiLogOut,
  FiArchive,
  FiUser,
} from "react-icons/fi";
import { auth, db } from "../../../backend/firebase.config";
import { doc, getDoc, onSnapshot, updateDoc, serverTimestamp } from "firebase/firestore";
import { signOut } from "firebase/auth";
import Swal from "sweetalert2"; // ✅ Import SweetAlert2
import ProfileSidebar from "./ProfileSidebar";

const ProfilePopup = ({ onClose }) => {
  const [firstName, setFirstName] = useState("Loading...");
  const [userData, setUserData] = useState(null);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);
  const [isOnline, setIsOnline] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) {
      setFirstName("Guest");
      setIsOnline(false);
      return;
    }

    const userRef = doc(db, "users", currentUser.uid);

    // Fetch initial user data
    getDoc(userRef)
      .then((userSnap) => {
        if (userSnap.exists()) {
          const data = userSnap.data();
          setUserData(data);
          setFirstName(data.firstName || "No Name");
          setIsOnline(data.isOnline || false);
        } else {
          setFirstName("Unknown User");
          setIsOnline(false);
        }
      })
      .catch((err) => {
        console.error("Failed to fetch user:", err);
        setFirstName("Error");
        setIsOnline(false);
      });

    // Listen for realtime updates on user document
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setIsOnline(data.isOnline || false);
        setFirstName(data.firstName || "No Name");
        setUserData(data);
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    const result = await Swal.fire({
      title: "Are you sure you want to log out?",
      text: "You will need to log in again to access your account.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#000",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, log me out",
    });

    if (!result.isConfirmed) return;

    try {
      // Update isOnline to false and set lastSeen timestamp on logout
      if (auth.currentUser) {
        const userRef = doc(db, "users", auth.currentUser.uid);
        await updateDoc(userRef, { 
          isOnline: false, 
          lastSeen: serverTimestamp(),
        });
      }

      await signOut(auth);

      Swal.fire({
        title: "Logged Out",
        text: "You have been successfully logged out.",
        icon: "success",
        confirmButtonColor: "#000",
      }).then(() => {
        navigate("/login");
      });
    } catch (error) {
      console.error("Error signing out:", error);
      Swal.fire({
        title: "Logout Failed",
        text: "Something went wrong. Please try again.",
        icon: "error",
        confirmButtonColor: "#000",
      });
    }
  };

  return (
    <>
      <div
        className="absolute left-2 top-16 w-64 bg-gray-800 text-white rounded-xl shadow-2xl z-50"
        style={{ animation: "fadeIn 0.3s ease-in-out" }}
      >
        {/* User Info */}
        <div
          className="flex items-center gap-4 p-4 border-b border-gray-700 cursor-pointer"
          onClick={() => setShowProfileSidebar(true)}
        >
          <div className="w-10 h-10 bg-gray-600 rounded-full flex items-center justify-center text-white text-xl">
            <FiUser />
          </div>
          <div>
            <h3 className="text-base font-semibold">{firstName}</h3>
            <p
              className={`text-sm ${
                isOnline ? "text-green-500" : "text-gray-400"
              }`}
            >
              {isOnline ? "Online" : "Offline"}
            </p>
          </div>
        </div>

        {/* Menu Items */}
        <ul className="p-2 text-sm">
          <li
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
            onClick={onClose}
          >
            <FiEdit /> Edit Profile
          </li>
          <li
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
            onClick={onClose}
          >
            <FiArchive /> Archived Chats
          </li>
          <li
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
            onClick={onClose}
          >
            <FiSettings /> Settings
          </li>
          <li
            className="flex items-center gap-3 px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md text-red-400 hover:text-red-300"
            onClick={handleLogout}
          >
            <FiLogOut /> Logout
          </li>
        </ul>
      </div>

      {/* Profile Sidebar */}
      {showProfileSidebar && (
        <ProfileSidebar
          userData={userData}
          onClose={() => setShowProfileSidebar(false)}
        />
      )}
    </>
  );
};

export default ProfilePopup;
