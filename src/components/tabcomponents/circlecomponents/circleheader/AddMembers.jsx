import { useState } from "react";
import {
  doc,
  getDocs,
  query,
  where,
  collection,
  setDoc,
} from "firebase/firestore";
import { db } from "../../../../../backend/firebase.config";

const AddMembers = ({ circle, onClose }) => {
  const [input, setInput] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [error, setError] = useState("");

  const handleAdd = async () => {
    if (!input.trim()) return;

    setIsAdding(true);
    setError("");

    try {
      // 1. Find the user by username
      const usersRef = collection(db, "users");
      const q = query(usersRef, where("username", "==", input.trim()));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError("User not found.");
        return;
      }

      const userDoc = querySnapshot.docs[0];
      const userData = userDoc.data();

      // 2. Check sector match
      if (userData.position !== circle.sector) {
        setError("This user is not in the same sector.");
        return;
      }

      // 3. Prepare member data
      const memberData = {
        name: userData.username,
        avatar: userData.avatar || null,
        bio: userData.bio || "",
        isAdmin: false,
      };

      // 4. Add to 'members' subcollection under the circle
      const memberRef = doc(db, "circles", circle.id, "members", userDoc.id);
      await setDoc(memberRef, memberData);

      setInput("");
      onClose();
    } catch (err) {
      console.error("Error adding member:", err);
      setError("Something went wrong.");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <div>
      <input
        type="text"
        value={input}
        onChange={(e) => {
          setInput(e.target.value);
          setError("");
        }}
        placeholder="Enter username"
        className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white"
      />

      {error && (
        <div className="mt-2 text-red-500 text-sm">{error}</div>
      )}

      <button
        onClick={handleAdd}
        disabled={isAdding}
        className="w-full mt-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded"
      >
        {isAdding ? "Adding..." : "Add Member"}
      </button>
    </div>
  );
};

export default AddMembers;
