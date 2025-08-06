import React, { useState } from "react";
import { FiArrowLeft, FiSave, FiCamera } from "react-icons/fi";

const EditProfileSidebar = ({ userData, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    firstName: userData?.firstName || "",
    lastName: userData?.lastName || "",
    email: userData?.email || "",
    username: userData?.username || "",
    position: userData?.position || "",
    bio: userData?.bio || "",
    profilePic: userData?.profilePic || "",
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    onSave(formData);
    onClose();
  };

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setFormData({ ...formData, profilePic: imageUrl });
    }
  };

  return (
    <>
      {/* Background Overlay */}
      <div
        className="fixed inset-0 bg-transparent z-40"
        onClick={onClose}
      ></div>

      {/* Sidebar */}
      <div className="fixed top-0 left-0 w-full md:w-96 h-full bg-gray-900 z-50 shadow-lg transition-all transform translate-x-0 duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <div className="flex items-center gap-2">
            <button onClick={onClose} className="text-xl text-gray-400 hover:text-white">
              <FiArrowLeft />
            </button>
            <h2 className="text-lg text-white font-semibold">Edit Profile</h2>
          </div>
          <button onClick={handleSave} className="text-green-500 hover:text-green-300">
            <FiSave />
          </button>
        </div>

        {/* Profile Picture Section */}
        <div className="flex flex-col items-center mt-6 mb-4">
          <div className="relative w-28 h-28">
            <img
              src={
                formData.profilePic ||
                `https://ui-avatars.com/api/?name=${formData.firstName}+${formData.lastName}&background=random`
              }
              alt="Profile"
              className="w-full h-full rounded-full object-cover border border-white shadow-lg"
            />
            {/* Camera Icon Overlay */}
            <label
              htmlFor="profile-pic-upload"
              className="absolute bottom-1 right-1 bg-white p-1.5 rounded-full shadow-md cursor-pointer hover:bg-gray-100 transition"
              title="Change Profile Picture"
            >
              <FiCamera className="text-gray-800 text-sm" />
            </label>
            <input
              id="profile-pic-upload"
              type="file"
              accept="image/*"
              onChange={handleProfilePicChange}
              className="hidden"
            />
          </div>
        </div>

        {/* Form Fields */}
        <div className="p-6 pt-2 text-white space-y-4">
          {["firstName", "lastName", "email", "username", "position", "bio"].map((field) => (
            <div key={field}>
              <label className="block text-sm text-gray-300 capitalize mb-1">
                {field === "firstName"
                  ? "First Name"
                  : field === "lastName"
                  ? "Last Name"
                  : field.charAt(0).toUpperCase() + field.slice(1)}
              </label>
              <input
                type="text"
                name={field}
                value={formData[field]}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-700 bg-gray-800 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default EditProfileSidebar;
