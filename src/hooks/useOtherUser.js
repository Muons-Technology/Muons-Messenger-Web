import { useEffect } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";

/**
 * Fetches and sets the other user in a 2-participant chat.
 *
 * @param {Array} participants - Array of user IDs in the chat.
 * @param {Object} currentUser - Current user object from Firebase Auth.
 * @param {Function} setOtherUser - React state setter to store the other user’s data.
 * @param {Function} setLastSeen - React state setter to store the other user’s last seen.
 */
export const useOtherUser = (
  participants,
  currentUser,
  setOtherUser,
  setLastSeen
) => {
  useEffect(() => {
    let ignore = false;

    const fetchOtherUser = async () => {
      if (!participants || participants.length !== 2 || !currentUser?.uid) return;

      const otherId = participants.find((id) => id !== currentUser.uid);
      if (!otherId) return;

      try {
        const docRef = doc(db, "users", otherId);
        const docSnap = await getDoc(docRef);

        if (!ignore && docSnap.exists()) {
          const data = docSnap.data();
          setOtherUser(data);

          const lastSeen =
            data.lastSeen?.toDate?.() ||
            (data.lastSeen instanceof Date ? data.lastSeen : new Date(data.lastSeen));
          setLastSeen(lastSeen);
        }
      } catch (error) {
        console.error("❌ Error fetching other user:", error);
      }
    };

    fetchOtherUser();

    return () => {
      ignore = true;
    };
  }, [participants, currentUser?.uid, setOtherUser, setLastSeen]);
};
