import { useEffect } from "react";
import { getMessages } from "../utils/indexedDB";

export const useLocalMessages = (combinedChatId, setMessages, setLoading) => {
  useEffect(() => {
    if (!combinedChatId) return;

    (async () => {
      try {
        const msgs = await getMessages(combinedChatId);
        if (msgs.length) {
          setMessages(msgs.map(m => ({
            ...m,
            timestamp: m.timestamp instanceof Date ? m.timestamp : new Date(m.timestamp)
          })));
        }
      } catch (e) {
        console.error("Error loading local messages:", e);
      } finally {
        setLoading(false);
      }
    })();
  }, [combinedChatId]);
};
