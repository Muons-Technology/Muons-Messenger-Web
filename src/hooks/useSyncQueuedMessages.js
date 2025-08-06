import { useEffect } from "react";
import { db, auth } from "../../backend/firebase.config";
import {
  collection,
  addDoc,
  updateDoc,
  doc,
  serverTimestamp,
} from "firebase/firestore";
import { getMessages, clearMessages } from "../utils/indexedDB";

export const useSyncQueuedMessages = (combinedChatId) => {
  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine || !combinedChatId) return;
      const user = auth.currentUser;
      if (!user) return;

      const queued = await getMessages(combinedChatId);
      if (!queued || queued.length === 0) return;

      for (const msg of queued) {
        await addDoc(collection(db, "chats", combinedChatId, "messages"), {
          ...msg,
          timestamp: serverTimestamp(),
          read: false,
        });
      }

      await updateDoc(doc(db, "chats", combinedChatId), {
        lastMessage: {
          text: queued.at(-1)?.message,
          senderId: user.uid,
          timestamp: serverTimestamp(),
          read: false,
        },
      });

      await clearMessages(combinedChatId);
      console.log("✅ Offline messages synced to Firestore.");
    };

    window.addEventListener("online", sync);
    return () => window.removeEventListener("online", sync);
  }, [combinedChatId]);
};
