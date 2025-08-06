import { formatDistanceToNow } from "date-fns";
import { FaTimes, FaEnvelope, FaPhoneAlt, FaUser } from "react-icons/fa";

const ChatProfileSidebar = ({ chat, onClose }) => {
  if (!chat) return null; 

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-opacity-50 backdrop-blur-sm z-40"
        onClick={onClose}
      />

      {/* Sidebar */}
      <div className="fixed right-0 top-0 h-full w-[26rem] bg-gray-900 text-gray-900 shadow-xl z-50 p-6 flex flex-col transition-transform duration-300 ease-in-out overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold text-white">Contact Info</h2>
          <button
            onClick={onClose}
            className="text-gray-600 text-3xl hover:text-red-500 transition-colors"
            aria-label="Close sidebar"
          >
            <FaTimes />
          </button>
        </div>

        {/* Profile Section */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-md mb-4">
            <img
              src={"/default-avatar.png"}
              className="w-full h-full object-cover"
              alt="User Avatar"
            />
          </div>
          <h3 className="text-2xl text-white font-bold mb-1">{chat.firstName}</h3>
          <p className="text-sm text-red-500 mb-1">
            {chat.status === "Online"
              ? "🟢 Online"
              : chat.lastSeen
              ? `Last seen ${formatDistanceToNow(new Date(chat.lastSeen), {
                  addSuffix: true,
                })}`
              : "Offline"}
          </p>
        </div>

        {/* Divider */}
        <hr className="my-4 border-gray-300" />

        {/* About */}
        {chat.about && (
          <div className="mb-6">
            <p className="text-sm text-gray-600 font-semibold mb-1">About</p>
            <div className="flex items-center gap-3 text-white">
              <FaUser className="text-white" />
              <span>{chat.firstName}</span>
            </div>
          </div>
        )}

        {/* Contact Info */}
        <div className="space-y-4">
          {chat.email && (
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Email</p>
              <div className="flex items-center gap-3 text-gray-800">
                <FaEnvelope className="text-green-500" />
                <span>{chat.email}</span>
              </div>
            </div>
          )}
          {chat.phone && (
            <div>
              <p className="text-sm text-gray-600 font-semibold mb-1">Phone</p>
              <div className="flex items-center gap-3 text-gray-800">
                <FaPhoneAlt className="text-yellow-500" />
                <span>{chat.phone}</span>
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <hr className="my-6 border-gray-300" />

        {/* Media Section */}
        <div className="mb-6">
          <p className="text-sm text-gray-600 font-semibold mb-2">Media, Links & Docs</p>
          <p className="text-sm text-gray-400 italic">No shared media yet</p>
        </div>

        {/* Spacer */}
        <div className="flex-grow" />

        {/* Footer */}
        <p className="text-xs text-center text-gray-400 mt-10">
          Chat powered by <span className="font-semibold text-blue-500">AVINX</span>
        </p>
      </div>
    </>
  );
};

export default ChatProfileSidebar;
