import React, { useState } from "react";
import { IoMdClose } from "react-icons/io";
import {
  MdInsertPhoto,
  MdStarBorder,
  MdLock,
  MdGroupAdd,
  MdLink,
} from "react-icons/md";
import { HiOutlineBell } from "react-icons/hi";
import { FiSearch } from "react-icons/fi";
import AddMembers from "./AddMembers";
import useMemberCount from "../../../../hooks/hooks_tabs/hooks_circles/useMemberCount";

const CircleHeaderSidebar = ({ circle, onCloseSidebar }) => {
  const [showAddModal, setShowAddModal] = useState(false);
  const members = circle?.members || [];

  const { count, label } = useMemberCount(circle?.id); // ✅ Get count & label dynamically

  return (
    <>
      <div className="fixed top-0 right-0 w-96 h-full bg-gray-900 border-l border-gray-700 overflow-y-auto z-50">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
          <h2 className="text-white font-semibold text-lg">Circle info</h2>
          <button
            onClick={onCloseSidebar}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <IoMdClose />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 text-white">
          {/* Circle Icon */}
          <div className="flex flex-col items-center justify-center">
            <div className="w-28 h-28 bg-[#2a3942] rounded-full flex items-center justify-center text-xs text-white cursor-pointer">
              <MdInsertPhoto className="text-2xl" />
              <span className="text-[11px] mt-1 block">Add Circle icon</span>
            </div>
            <h2 className="mt-4 text-lg font-semibold text-center">
              {circle?.name || "Circle Name"}
            </h2>
            <p className="text-sm text-gray-400 text-center">
              Circle • {label}
            </p>
          </div>

          {/* Description */}
          <div className="mt-6 text-center">
            <button className="text-green-400 text-sm hover:underline">
              {circle.description}
            </button>
          </div>

          <div className="mt-3 text-xs text-gray-400 text-center">
            Circle created by you, on 28/03/2025 at 10:58
          </div>

          <hr className="my-6 border-gray-700" />

          {/* Quick Actions */}
          <div className="space-y-3">
            <div className="flex items-center justify-between px-2 py-3 hover:bg-[#202c33] cursor-pointer rounded">
              <div className="flex items-center gap-3">
                <MdInsertPhoto className="text-xl" />
                <span className="text-sm">Media, links and docs</span>
              </div>
              <span className="text-sm text-gray-400">0</span>
            </div>

            <div className="flex items-center gap-3 px-2 py-3 hover:bg-[#202c33] cursor-pointer rounded">
              <MdStarBorder className="text-xl" />
              <span className="text-sm">Starred messages</span>
            </div>

            <div className="flex items-center justify-between px-2 py-3 hover:bg-[#202c33] cursor-pointer rounded">
              <div className="flex items-center gap-3">
                <HiOutlineBell className="text-xl" />
                <span className="text-sm">Mute notifications</span>
              </div>
              <div className="w-10 h-5 bg-gray-600 rounded-full flex items-center p-1">
                <div className="w-4 h-4 bg-white rounded-full"></div>
              </div>
            </div>

            <div className="flex items-center gap-3 px-2 py-3 hover:bg-[#202c33] cursor-pointer rounded">
              <MdLock className="text-xl" />
              <span className="text-sm">Circle Permissions</span>
            </div>

            <div className="flex items-center gap-3 px-2 py-3 hover:bg-[#202c33] cursor-pointer rounded">
              <MdLock className="text-xl" />
              <span className="text-sm">Encryption</span>
            </div>
          </div>

          <hr className="my-6 border-gray-700" />

          {/* Participants Header */}
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm text-gray-400">{label}</h3>
            <FiSearch className="text-gray-400 cursor-pointer" />
          </div>

          {/* Add/Invite Buttons */}
          <div className="space-y-3 mb-4">
            <div
              className="flex items-center gap-3 px-3 py-2 hover:bg-[#202c33] cursor-pointer rounded"
              onClick={() => setShowAddModal(true)}
            >
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                <MdGroupAdd />
              </div>
              <span className="text-sm">Add member</span>
            </div>

            <div className="flex items-center gap-3 px-3 py-2 hover:bg-[#202c33] cursor-pointer rounded">
              <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white">
                <MdLink />
              </div>
              <span className="text-sm">Invite to group via link</span>
            </div>
          </div>

          {/* Members List */}
          <ul className="space-y-4">
            {members.map((member, idx) => (
              <li key={idx} className="flex gap-3 items-start">
                <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center text-white text-sm">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    member.name?.charAt(0)?.toUpperCase()
                  )}
                </div>
                <div className="flex-1">
                  <p className="font-medium text-sm">{member.name}</p>
                  {member.bio && (
                    <p className="text-gray-400 text-sm truncate">{member.bio}</p>
                  )}
                </div>
                {member.isAdmin && (
                  <span className="bg-[#2a3942] text-green-400 text-[11px] px-2 py-0.5 rounded-full">
                    Circle Admin
                  </span>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Add Members Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-[#111b21] w-full max-w-md p-6 rounded-lg shadow-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Add Members</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-gray-400 hover:text-white text-xl"
              >
                <IoMdClose />
              </button>
            </div>
            <AddMembers circle={circle} onClose={() => setShowAddModal(false)} />
          </div>
        </div>
      )}
    </>
  );
};

export default CircleHeaderSidebar;
