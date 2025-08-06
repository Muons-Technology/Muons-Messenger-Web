import { useEffect } from "react";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import { saveMessages } from "../utils/indexedDB";

export const useFirestoreMessages = (
  combinedChatId,
  setMessages,
  scrollToBottom
) => {
  useEffect(() => {
    if (!combinedChatId) return;

    const messagesRef = collection(db, "chats", combinedChatId, "messages");
    const messagesQuery = query(messagesRef, orderBy("timestamp", "asc"));

    const unsubscribe = onSnapshot(messagesQuery, async (snapshot) => {
      if (snapshot.empty) {
        setMessages([]);
        return;
      }

      const fetchedMessages = snapshot.docs.map((docSnap) => {
        const data = docSnap.data();
        const timestamp =
          data.timestamp?.toDate?.() ||
          (data.timestamp instanceof Date
            ? data.timestamp
            : new Date());

        return {
          id: docSnap.id,
          ...data,
          timestamp,
        };
      });

      // Optional: Prevent duplicate re-renders (not strictly needed here)
      // const uniqueMessages = Array.from(new Map(fetchedMessages.map(m => [m.id, m])).values());

      setMessages(fetchedMessages);

      try {
        await saveMessages(combinedChatId, fetchedMessages);
      } catch (err) {
        console.error("🛑 IndexedDB save error:", err);
      }

      scrollToBottom?.();
    });

    return () => unsubscribe();
  }, [combinedChatId]);
};
