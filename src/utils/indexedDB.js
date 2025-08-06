// src/utils/indexedDB.js
const DB_NAME = "chatAppDB";
const STORE_NAME = "messagesStore";
const DB_VERSION = 1;

// Open or upgrade the IndexedDB
export function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" }); // Each message has unique `id`
      }
    };
  });
}

// Save an array of messages to IndexedDB for a chat
export async function saveMessages(chatId, messages) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readwrite");
    const store = tx.objectStore(STORE_NAME);
    messages.forEach((msg) => {
      store.put({ ...msg, chatId });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

// Get all messages for a specific chat
export async function getMessages(chatId) {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const allMessages = request.result;
      const filtered = allMessages.filter((msg) => msg.chatId === chatId);
      filtered.sort((a, b) => {
        const aTime = a.timestamp?.seconds || a.timestamp || 0;
        const bTime = b.timestamp?.seconds || b.timestamp || 0;
        return aTime - bTime;
      });
      resolve(filtered);
    };

    request.onerror = () => reject(request.error);
  });
}

// ✅ Get queued (unsynced) messages grouped by chatId
export async function getQueuedMessages() {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, "readonly");
    const store = tx.objectStore(STORE_NAME);
    const request = store.getAll();

    request.onsuccess = () => {
      const messages = request.result;
      const grouped = {};

      messages.forEach((msg) => {
        if (!grouped[msg.chatId]) grouped[msg.chatId] = [];
        grouped[msg.chatId].push(msg);
      });

      resolve(grouped);
    };

    request.onerror = () => reject(request.error);
  });
}

// ✅ Clear all messages for a specific chatId (after sync)
export async function clearMessages(chatId) {
  const db = await openDB();
  const tx = db.transaction(STORE_NAME, "readwrite");
  const store = tx.objectStore(STORE_NAME);

  const allMessages = await store.getAll();

  await Promise.all(
    allMessages
      .filter((msg) => msg.chatId === chatId)
      .map((msg) => store.delete(msg.id))
  );

  await tx.done;
}
