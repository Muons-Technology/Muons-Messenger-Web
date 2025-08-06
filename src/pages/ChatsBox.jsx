import React, { useState, useEffect } from "react";
import Sidebar from "../components/Sidebar";
import ChatWindow from "../components/ChatWindow";
import CircleWindow from "../components/tabcomponents/circlecomponents/circlewindow/CircleWindow";
import ErrorBoundary from "../components/errors/ErrorBoundary";

// Importing images
import muons from "../assets/images/rebrand.png";
import { IoMdLock } from "react-icons/io";

function ChatsBox() {
  const [selectedChat, setSelectedChat] = useState(null);
  const [selectedCircle, setSelectedCircle] = useState(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleBack = () => {
    setSelectedChat(null);
    setSelectedCircle(null);
  };

  const hasSelected = selectedChat || selectedCircle;

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* Sidebar */}
      {(!isMobile || !hasSelected) && (
        <div
          className={`h-full bg-white border-r border-gray-300 ${
            isMobile ? "w-full" : "w-[25%]"
          }`}
        >
          <Sidebar
            setSelectedChat={chat => {
              setSelectedChat(chat);
              setSelectedCircle(null);
            }}
            setSelectedCircle={circle => {
              setSelectedCircle(circle);
              setSelectedChat(null);
            }}
          />
        </div>
      )}

      {/* Main Content Area */}
      {(!isMobile || hasSelected) && (
        <div
          className={`h-full bg-black text-white ${
            isMobile ? "w-full" : "w-[90%]"
          }`}
        >
          <ErrorBoundary>
            {selectedChat && (
              <ChatWindow
                chat={selectedChat}
                onBack={isMobile ? handleBack : null}
              />
            )}
            {selectedCircle && (
              <CircleWindow
                circle={selectedCircle}
                onBack={isMobile ? handleBack : null}
              />
            )}
            {!selectedChat && !selectedCircle && !isMobile && (
              <div className="flex flex-col justify-between h-full px-4 py-8">
                {/* Welcome Area */}
                <div
                  style={{ marginTop: "140px" }}
                  className="flex flex-col items-center justify-center"
                >
                  <img
                    src={muons}
                    alt="Chat Illustration"
                    className="w-72 h-auto mb-8 opacity-90"
                  />
                  <p className="text-lg text-gray-300 font-medium">
                    Welcome To Muons Messenger
                  </p>
                </div>

                {/* Encryption Note */}
                <div className="flex flex-row justify-center text-gray-500 text-sm opacity-70">
                  <IoMdLock className="text-xl mb-1" />
                  <p>Your personal messages are end-to-end encrypted</p>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      )}
    </div>
  );
}

export default ChatsBox;
