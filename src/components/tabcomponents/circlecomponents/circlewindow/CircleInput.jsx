import { useState } from "react";
import { IoMdSend } from "react-icons/io";

const CircleInput = ({ onSend }) => {
  const [input, setInput] = useState("");

  const handleSend = () => {
    const trimmed = input.trim();
    if (trimmed) {
      onSend(trimmed);
      setInput("");
    }
  };

  return (
    <div className="px-4 py-3 border-t border-gray-800 flex items-center">
      <input
        value={input}
        onChange={(e) => setInput(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSend()}
        placeholder="Type a message"
        className="flex-1 bg-[#2a3942] text-white text-sm px-4 py-2 rounded-full outline-none"
      />
      <button
        onClick={handleSend}
        className="ml-2 text-xl text-green-400 hover:text-green-300"
      >
        <IoMdSend />
      </button>
    </div>
  );
};

export default CircleInput;
