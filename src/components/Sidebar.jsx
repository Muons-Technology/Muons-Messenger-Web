import { useState, useEffect, useRef } from "react";
import { FaUserCircle } from "react-icons/fa";
import { FiPlus } from "react-icons/fi";
import { IoMdNotificationsOutline } from "react-icons/io";
import { RiWifiLine } from "react-icons/ri";
import Swal from "sweetalert2";
import "sweetalert2/dist/sweetalert2.min.css";

import SectorPanel from "./tabcomponents/SectorPanel";
import ChatList from "./ChatList";
import ProfilePopup from "./sidebarcomponents/ProfilePopup";
import NewContactPopup from "./sidebarcomponents/NewContactPopup";
import NotificationPopup from "./sidebarcomponents/NotificationPopup";

import {
  collection,
  doc,
  setDoc,
  updateDoc,
  onSnapshot,
  getDoc,
  query,
  where,
} from "firebase/firestore";
import { auth, db } from "../../backend/firebase.config";

const Sidebar = ({ setSelectedChat, currentUser }) => {
  const [collapsed, setCollapsed] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [showNewContactPopup, setShowNewContactPopup] = useState(false);
  const [showNotificationPopup, setShowNotificationPopup] = useState(false);
  const [friendRequests, setFriendRequests] = useState([]);
  const [activeTab, setActiveTab] = useState("general");

  const [userData, setUserData] = useState(null); // ✅ Full user data from Firestore

  const popupRef = useRef();

  const toggleSidebar = () => setCollapsed(!collapsed);
  const toggleProfilePopup = () => setShowProfilePopup(!showProfilePopup);
  const toggleNewContactPopup = () => setShowNewContactPopup(!showNewContactPopup);
  const toggleNotificationPopup = () => setShowNotificationPopup(!showNotificationPopup);

  // ✅ Fetch full user data from Firestore
  useEffect(() => {
    const fetchUserData = async () => {
      if (!auth.currentUser) return;
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUserData(userSnap.data());
      }
    };

    fetchUserData();
  }, []);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    const handleClickOutside = (e) => {
      if (popupRef.current && !popupRef.current.contains(e.target)) {
        setShowProfilePopup(false);
        setShowNewContactPopup(false);
        setShowNotificationPopup(false);
      }
    };
    window.addEventListener("resize", handleResize);
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      window.removeEventListener("resize", handleResize);
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    if (!auth.currentUser?.uid) return;

    const q = query(
      collection(db, "friendRequests"),
      where("toUserId", "==", auth.currentUser.uid),
      where("status", "==", "pending")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setFriendRequests(data);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const handleRegistration = (e) => {
      const { userId, ip } = e.detail;
      Swal.fire({
        toast: true,
        icon: "success",
        title: "✅ Registered on Muons Server",
        text: `Connected to host at ${ip}`,
        position: "top-end",
        showConfirmButton: false,
        timer: 2500,
      });
    };

    window.addEventListener("user-registered", handleRegistration);
    if (window._lastUserRegisteredEvent) {
      handleRegistration(window._lastUserRegisteredEvent);
    }

    return () => {
      window.removeEventListener("user-registered", handleRegistration);
    };
  }, []);

  const handleDecline = async (req) => {
    await updateDoc(doc(db, "friendRequests", req.id), { status: "declined" });
  };

  const handleAccept = async (req) => {
    const { id, fromUserId, toUserId, fromUsername } = req;

    await updateDoc(doc(db, "friendRequests", id), { status: "accepted" });

    await setDoc(doc(collection(db, "usersFriends"), `${toUserId}_${fromUserId}`), {
      userId: toUserId,
      friendId: fromUserId,
      username: fromUsername,
      status: "accepted",
    });

    await setDoc(doc(collection(db, "usersFriends"), `${fromUserId}_${toUserId}`), {
      userId: fromUserId,
      friendId: toUserId,
      username: currentUser.username || "You",
      status: "accepted",
    });
  };

  const sidebarWidth = isMobile ? "w-full" : collapsed ? "w-[80px]" : "w-[420px]";

  return (
    <div
      className={`${sidebarWidth} h-full bg-gray-900 border-r border-gray-700 shadow-sm flex flex-col transition-all duration-300 relative`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700 relative">
        <div
          className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center shadow-md cursor-pointer"
          onClick={toggleProfilePopup}
        >
          <FaUserCircle className="text-gray-400 text-2xl" />
        </div>

        {/* Popups */}
        {showProfilePopup && (
          <div ref={popupRef}>
            <ProfilePopup user={userData} onClose={() => setShowProfilePopup(false)} />
          </div>
        )}
        {showNewContactPopup && (
          <div ref={popupRef}>
            <NewContactPopup
              onClose={() => setShowNewContactPopup(false)}
              addToChatList={() => {}}
            />
          </div>
        )}
        {showNotificationPopup && (
          <div ref={popupRef}>
            <NotificationPopup
              requests={friendRequests}
              onAccept={handleAccept}
              onDecline={handleDecline}
            />
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          <button
            className="p-2 rounded-full hover:bg-transparent hover:text-gray-200"
            onClick={toggleNewContactPopup}
          >
            <FiPlus className="text-gray-400 text-lg" />
          </button>
          <button
            className="p-2 relative rounded-full hover:bg-transparent hover:text-gray-200"
            onClick={toggleNotificationPopup}
          >
            <IoMdNotificationsOutline className="text-gray-400 text-lg" />
            {friendRequests.length > 0 && (
              <span className="absolute top-0 right-0 w-2.5 h-2.5 bg-yellow-500 rounded-full border border-gray-900"></span>
            )}
          </button>
          <button
            className="p-2 rounded-full hover:bg-transparent hover:text-gray-200"
            onClick={() => {
              const input = window.prompt("Type 'host' to start server or IP (e.g., 192.168.x.x) to join:");
              if (input === "host") {
                localStorage.setItem("ws_mode", "host");
                localStorage.removeItem("ws_ip");
                Swal.fire({
                  toast: true,
                  icon: "info",
                  title: "🟢 Hosting mode set",
                  text: "Start the server to accept connections.",
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 2000,
                });
              } else if (input?.match(/^(\d{1,3}\.){3}\d{1,3}$/)) {
                localStorage.setItem("ws_mode", "join");
                localStorage.setItem("ws_ip", input);
                Swal.fire({
                  toast: true,
                  icon: "info",
                  title: "🔗 Joining mode set",
                  text: `Will connect to ws://${input}:5050`,
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 2000,
                });
              } else {
                Swal.fire({
                  toast: true,
                  icon: "warning",
                  title: "⚠️ Invalid input",
                  text: "Enter 'host' or IP like 192.168.0.100",
                  position: "top-end",
                  showConfirmButton: false,
                  timer: 2500,
                });
              }
            }}
          >
            <RiWifiLine className="text-gray-400 text-lg" />
          </button>
        </div>
      </div>

      {/* Search */}
      {!collapsed && (
        <div className="p-4 border-b border-gray-700">
          <input
            type="text"
            placeholder="Search Circle or start new chat"
            className="w-full px-4 py-2 text-sm rounded-lg bg-gray-800 text-gray-300 outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      )}

      {/* Tab Navigation */}
      {!collapsed && (
        <div className="flex justify-around p-2 border-b border-gray-700 bg-gray-800 text-sm text-gray-300">
          <button
            className={`px-4 py-1 rounded-full ${
              activeTab === "general" ? "bg-gray-600" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("general")}
          >
            General
          </button>
          <button
            className={`px-4 py-1 rounded-full ${
              activeTab === "sector" ? "bg-gray-600" : "hover:bg-gray-700"
            }`}
            onClick={() => setActiveTab("sector")}
          >
            Your Sector
          </button>
        </div>
      )}

      {/* Chat List or Sector Panel */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {activeTab === "general" ? (
          <ChatList
            setSelectedChat={setSelectedChat}
            collapsed={collapsed}
            filterBySector={false}
            currentUserSector={userData?.sector}
          />
        ) : (
          <SectorPanel userData={userData} />
        )}
      </div>
    </div>
  );
};

export default Sidebar;
