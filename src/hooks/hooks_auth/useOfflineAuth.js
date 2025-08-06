// src/hooks/useOfflineAuth.js
import { useCallback } from "react";

const STORAGE_KEY = "offlineUsers";

export const useOfflineAuth = () => {
  // Save user credentials locally (after successful Firebase login)
  const saveOfflineUser = useCallback((email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");

    const exists = users.find((u) => u.email === email);
    if (!exists) {
      users.push({ email, password }); // ⚠️ For production, hash or encrypt this!
      localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    }
  }, []);

  // Try logging in from localStorage
  const tryOfflineLogin = useCallback((email, password) => {
    const users = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return users.find((u) => u.email === email && u.password === password) || null;
  }, []);

  return {
    saveOfflineUser,
    tryOfflineLogin,
  };
};
