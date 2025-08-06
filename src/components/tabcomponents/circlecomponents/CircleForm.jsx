import { useState, useEffect } from "react";
import {
  collection,
  addDoc,
  serverTimestamp,
  doc,
  setDoc,
  onSnapshot,
} from "firebase/firestore";
import { db, auth } from "../../../../backend/firebase.config";
import { FiArrowLeft } from "react-icons/fi";

const CircleForm = ({ onBack, onClose }) => {
  const [circleName, setCircleName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const [userSector, setUserSector] = useState("");

  // Fetch current user's sector (position) in real time
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);

    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserSector(data.position || "Unknown");
      }
    });

    return () => unsubscribe();
  }, []);

  const handleCreateCircle = async () => {
    if (!circleName.trim()) return alert("Circle name is required");
    setIsCreating(true);

    const currentUser = auth.currentUser;
    if (!currentUser) {
      alert("User not authenticated");
      setIsCreating(false);
      return;
    }

    try {
      // Step 1: Create the circle document
      const circleRef = await addDoc(collection(db, "circles"), {
        name: circleName.trim(),
        description: description.trim(),
        sector: userSector || "Unknown",
        createdBy: currentUser.uid,
        createdAt: serverTimestamp(),
      });

      // Step 2: Add the creator as a member with role "boss"
      const memberRef = doc(
        db,
        "circles",
        circleRef.id,
        "members",
        currentUser.uid
      );

      await setDoc(memberRef, {
        uid: currentUser.uid,
        name: currentUser.displayName || "Unnamed User",
        role: "boss",
        joinedAt: serverTimestamp(),
      });

      setCircleName("");
      setDescription("");
      onClose();
    } catch (err) {
      console.error("Error creating circle:", err);
      alert("Failed to create circle.");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="p-6 text-gray-200 h-full flex flex-col">
      <div className="flex items-center mb-6">
        <button onClick={onBack} className="mr-3 text-xl hover:text-white">
          <FiArrowLeft />
        </button>
        <h2 className="text-xl font-semibold">Create New Circle</h2>
      </div>

      <div className="flex-1">
        <div className="mb-4">
          <label className="block text-sm mb-1">Circle Name</label>
          <input
            type="text"
            value={circleName}
            onChange={(e) => setCircleName(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            placeholder="e.g. Product Team"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded"
            rows="4"
            placeholder="Optional"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm mb-1">Sector</label>
          <input
            type="text"
            value={userSector}
            disabled
            className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-gray-400 cursor-not-allowed"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-2 mt-auto">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 rounded hover:bg-gray-500"
        >
          Cancel
        </button>
        <button
          onClick={handleCreateCircle}
          disabled={isCreating}
          className="px-4 py-2 bg-blue-600 rounded hover:bg-blue-500"
        >
          {isCreating ? "Creating..." : "Create"}
        </button>
      </div>
    </div>
  );
};

export default CircleForm;
