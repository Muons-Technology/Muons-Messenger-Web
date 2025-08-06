// src/components/SplashScreen.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function SplashScreen() {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate("/signup");
    }, 3000); // 3-second delay

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="h-screen w-screen bg-black flex flex-col justify-between items-center text-white animate-fadeIn px-4">
      {/* Centered Middle Content */}
      <div className="flex-1 flex flex-col items-center justify-center text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-wide mb-4">
          Muons Messenger
        </h1>
        <p className="text-base md:text-lg text-gray-400">
          Connecting People...
        </p>
      </div>

      {/* Footer */}
      <footer className="mb-6 text-sm text-center text-gray-600">
        <p>from</p>
        <p className="font-semibold text-white">Muons Technology</p>
      </footer>
    </div>
  );
}

export default SplashScreen;
