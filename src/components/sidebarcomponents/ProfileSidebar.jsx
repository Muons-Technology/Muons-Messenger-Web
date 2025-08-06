import React, { useState } from "react";
import {
  FiArrowLeft,
  FiEdit,
  FiLogOut,
  FiCamera,
  FiShield,
  FiGlobe,
  FiBell,
  FiMoreVertical,
  FiUser,
  FiMail,
  FiAtSign,
  FiBriefcase,
  FiInfo,
} from "react-icons/fi";
import EditProfileSidebar from "../sidebarcomponents/editprofilesidebar/EditProfileSidebar";

const ProfileSidebar = ({ userData, onClose }) => {
  const [editOpen, setEditOpen] = useState(false);
  const [currentUserData, setCurrentUserData] = useState(userData);

  const handleSaveProfile = (updatedData) => {
    setCurrentUserData(updatedData);
  };

  return (
    <>
      {/* Dark Background */}
      <div
        className="fixed inset-0  bg-opacity-50 z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-full md:w-103 h-full overflow-y-auto bg-gray-900 shadow-xl z-50 transform translate-x-0 transition-all ease-in-out duration-300">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b bg-transparent">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xl text-gray-600">
              <FiArrowLeft />
            </button>
            <h2 className="text-lg font-semibold text-white">Profile</h2>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setEditOpen(true)}
              className="text-white hover:text-gray-800 transition"
            >
              <FiEdit />
            </button>
            <button className="text-white hover:text-gray-800 transition">
              <FiMoreVertical />
            </button>
          </div>
        </div>

        {/* Profile Picture with Camera Icon */}
        <div className="flex flex-col items-center py-6 relative">
          <div className="relative">
            <div className="w-28 h-28 bg-gray-300 rounded-full flex items-center justify-center text-4xl text-white">
              {currentUserData?.firstName?.[0] || "U"}
            </div>
            <button className="absolute bottom-2 right-2 bg-white p-1 rounded-full shadow-md">
              <FiCamera className="text-gray-600" />
            </button>
          </div>
          <h3 className="text-xl font-semibold text-white mt-4">
            {currentUserData?.firstName || "User"}
          </h3>
          <p className="text-sm text-gray-400">
            {currentUserData?.status || "Online"}
          </p>
        </div>

        {/* User Info Section with Icons */}
        <div className="px-6 space-y-3 text-sm text-gray-100">
          <div className="flex items-center gap-2">
            <FiUser />
            <div>
              <p className="text-xs text-white">Full Name</p>
              <p>{`${currentUserData?.firstName} ${currentUserData?.lastName}`}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiMail />
            <div>
              <p className="text-xs text-white">Email</p>
              <p>{currentUserData?.email || "user@example.com"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiAtSign />
            <div>
              <p className="text-xs text-white">Username</p>
              <p>@{currentUserData?.username || "username"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiBriefcase />
            <div>
              <p className="text-xs text-white"> Sector </p>
              <p>{currentUserData?.position || "Not set"}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <FiInfo />
            <div>
              <p className="text-xs text-white">Bio</p>
              <p>{currentUserData?.bio || "No bio set."}</p>
            </div>
          </div>
        </div>

        {/* Settings Menu */}
        <div className="mt-6 px-6 space-y-2">
          <button className="w-full py-3 flex items-center gap-3 text-white hover:bg-gray-100 rounded-lg transition duration-200">
            <FiShield /> <h4 className="text-xs ">Privacy & Security</h4>
          </button>
          <button className="w-full py-3 flex items-center gap-3 text-white hover:bg-gray-100 rounded-lg transition duration-200">
            <FiGlobe /> <h4 className="text-xs "> Language </h4>
          </button>
          <button className="w-full py-3 flex items-center gap-3 text-white hover:bg-gray-100 rounded-lg transition duration-200">
            <FiBell /> <h4 className="text-xs "> Notifications & Sounds </h4>
          </button>
        </div>

        {/* Logout */}
        <div className="px-6 mt-4 mb-6">
          <button className="w-full py-3 flex items-center gap-3 text-red-600 hover:bg-red-100 rounded-lg transition duration-200">
            <FiLogOut /> <h4 className="text-xs "> Logout </h4>
          </button>
        </div>
      </div>

      {editOpen && (
        <EditProfileSidebar
          userData={currentUserData}
          onClose={() => setEditOpen(false)}
          onSave={handleSaveProfile}
        />
      )}
    </>
  );
};

export default ProfileSidebar;
