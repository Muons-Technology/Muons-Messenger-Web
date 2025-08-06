import { useState } from "react";
import EmojiPicker from "emoji-picker-react";

const ChatInput = ({ sendMessage }) => {
  const [message, setMessage] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);

  const handleEmojiClick = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  const trimmed = message.trim();
  if (!trimmed) return;

  console.log("✉️ Submitting message from ChatInput:", trimmed); 

  await sendMessage(trimmed);
  setMessage("");
  setShowEmojiPicker(false);
};


  return (
    <div className="relative">
      {showEmojiPicker && (
        <div className="absolute bottom-16 left-4 z-10">
          <EmojiPicker onEmojiClick={handleEmojiClick} />
        </div>
      )}
      <form
        onSubmit={handleSubmit}
        className="flex items-center px-4 py-3 border-t border-gray-700 bg-gray-900"
      >
        <button
          type="button"
          onClick={() => setShowEmojiPicker((prev) => !prev)}
          className="text-xl mr-2"
          aria-label="Toggle emoji picker"
        >
          😊
        </button>
        <input
          type="text"
          placeholder="Type your message..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="flex-grow bg-gray-800 text-white rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          aria-label="Message input"
        />
        <button
          type="submit"
          className="ml-4 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default ChatInput;
