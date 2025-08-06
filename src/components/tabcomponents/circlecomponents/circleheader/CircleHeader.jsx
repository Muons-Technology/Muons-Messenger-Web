// components/CircleHeader.jsx
import React, { useState } from "react";
import { IoMdArrowBack } from "react-icons/io";
import { FaVideo, FaCircle, FaEllipsisV } from "react-icons/fa";
import { IoIosArrowDown } from "react-icons/io";
import { Menu } from "@headlessui/react";
import CircleHeaderSidebar from "./CircleHeaderSidebar";
import useMemberCount from "../../../../hooks/hooks_tabs/hooks_circles/useMemberCount";

const CircleHeader = ({ circle, onClose }) => {
  const [showSidebar, setShowSidebar] = useState(false);
  const { label: memberLabel } = useMemberCount(circle?.id);

  return (
    <>
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700 w-full">
        {/* Left Section */}
        <div className="flex items-center space-x-3">
          <button
            onClick={onClose}
            className="text-xl text-gray-300 hover:text-white"
          >
            <IoMdArrowBack />
          </button>

          <FaCircle className="text-xs text-green-400" />

          <div className="cursor-pointer" onClick={() => setShowSidebar(true)}>
            <h2 className="font-semibold text-sm text-white">
              {circle?.name || "Circle Name"}
            </h2>
            <p className="text-xs text-gray-400">{memberLabel}</p>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4 text-gray-300">
          {/* Video Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="hover:text-white flex items-center space-x-1">
              <FaVideo />
              <IoIosArrowDown className="text-xs" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-40 bg-[#2a3942] border border-gray-700 rounded shadow-lg text-sm z-50">
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Schedule Event
              </div>
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Start Meeting
              </div>
            </Menu.Items>
          </Menu>

          {/* Circle Dropdown */}
          <Menu as="div" className="relative">
            <Menu.Button className="hover:text-white flex items-center space-x-1">
              <FaCircle />
              <IoIosArrowDown className="text-xs" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-52 bg-[#2a3942] border border-gray-700 rounded shadow-lg text-sm z-50">
              <div className="px-4 py-2 text-gray-400 cursor-not-allowed">
                Mini Circles (Coming Soon)
              </div>
            </Menu.Items>
          </Menu>

          {/* More Options */}
          <Menu as="div" className="relative">
            <Menu.Button className="hover:text-white">
              <FaEllipsisV />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-36 bg-[#2a3942] border border-gray-700 rounded shadow-lg text-sm z-50">
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Circle Info
              </div>
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Select Messages
              </div>
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                View Details
              </div>
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Add to favorites
              </div>
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Clear Chats
              </div>
              <div className="px-4 py-2 hover:bg-[#3b4a54] cursor-pointer">
                Leave Circle
              </div>
            </Menu.Items>
          </Menu>
        </div>
      </div>

      {showSidebar && (
        <CircleHeaderSidebar
          circle={circle}
          onCloseSidebar={() => setShowSidebar(false)}
        />
      )}
    </>
  );
};

export default CircleHeader;
