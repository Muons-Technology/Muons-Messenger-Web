import { useEffect } from "react";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  writeBatch,
  doc
} from "firebase/firestore";
import { db } from "../../backend/firebase.config";

export const useMarkMessagesAsRead = (combinedChatId, currentUser) => {
  useEffect(() => {
    if (!combinedChatId || !currentUser?.uid) return;

    const ref = collection(db, "chats", combinedChatId, "messages");
    const q = query(ref, orderBy("timestamp", "asc"));

    const unsub = onSnapshot(q, async (snap) => {
      const batch = writeBatch(db);
      let hasUnread = false;

      snap.docs.forEach(docSnap => {
        const msg = docSnap.data();
        if (msg.senderId !== currentUser.uid && msg.read === false) {
          const msgRef = doc(db, "chats", combinedChatId, "messages", docSnap.id);
          batch.update(msgRef, { read: true });
          hasUnread = true;
        }
      });

      if (hasUnread) {
        await batch.commit();
      }
    });

    return unsub;
  }, [combinedChatId, currentUser]);
};
