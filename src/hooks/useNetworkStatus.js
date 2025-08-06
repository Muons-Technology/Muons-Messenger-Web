import { useEffect, useState } from "react";
import Swal from "sweetalert2";
import { doc, getDoc } from "firebase/firestore";
import { db, auth } from "../../backend/firebase.config";

// Utility to check if IP is local
const isLocalIP = (ip) => {
  return (
    ip?.startsWith("192.") ||
    ip?.startsWith("10.") ||
    ip?.startsWith("172.")
  );
};

// Get IP using WebRTC
const getLocalIP = () => {
  return new Promise((resolve, reject) => {
    const pc = new RTCPeerConnection({ iceServers: [] });
    pc.createDataChannel("");

    pc.createOffer()
      .then((offer) => pc.setLocalDescription(offer))
      .catch(reject);

    pc.onicecandidate = (event) => {
      if (!event || !event.candidate) return;
      const ipMatch = event.candidate.candidate.match(
        /([0-9]{1,3}(\.[0-9]{1,3}){3})/
      );
      if (ipMatch) {
        resolve(ipMatch[1]);
        pc.close();
      }
    };

    setTimeout(() => {
      reject("⏳ Timeout trying to detect local IP");
      pc.close();
    }, 3000);
  });
};

// Fallback to fetch from your WebSocket server
const fetchIPFromServer = async () => {
  try {
    const ip = localStorage.getItem("ws_ip") || "localhost";
    const url = `http://${ip}:5050/get-ip`;

    const res = await fetch(url);
    if (!res.ok) throw new Error("🌐 Failed to fetch IP from signaling server");
    const data = await res.json();
    return data.clientIp || data.ip || null;
  } catch (err) {
    console.error("🛑 Server IP fallback failed:", err);
    return null;
  }
};

export const useNetworkStatus = () => {
  const [isOnline, setIsOnline] = useState(null);
  const [localIP, setLocalIP] = useState(null);

  useEffect(() => {
    let ignore = false;

    const showLocalConnectionAlert = (ip) => {
      Swal.fire({
        position: "top",
        icon: "info",
        title: `Connected via Local Network (${ip})`,
        toast: true,
        showConfirmButton: false,
        timer: 2000,
      });
    };

    const detectLocalIP = async () => {
      try {
        const ip = await getLocalIP();
        if (!ignore && isLocalIP(ip)) {
          setLocalIP(ip);
          showLocalConnectionAlert(ip);
        }
      } catch (err) {
        console.warn("⚠️ WebRTC IP detection failed:", err);
        const fallbackIP = await fetchIPFromServer();
        if (!ignore && isLocalIP(fallbackIP)) {
          setLocalIP(fallbackIP);
          showLocalConnectionAlert(fallbackIP);
        }
      }
    };

    const checkUserOnlineStatus = async () => {
      const user = auth.currentUser;
      if (!user) return;

      try {
        const userDocRef = doc(db, "users", user.uid);
        const userSnap = await getDoc(userDocRef);
        const userData = userSnap.data();

        if (userData?.isOnline) {
          if (!ignore) {
            setIsOnline(true);
            Swal.fire({
              position: "top",
              icon: "success",
              title: "✅ You are online (Firestore)",
              toast: true,
              showConfirmButton: false,
              timer: 1500,
            });
          }
        } else {
          if (!ignore) {
            setIsOnline(false);
            Swal.fire({
              position: "top",
              icon: "warning",
              title: "⚠️ Not online (Firestore), checking local...",
              toast: true,
              showConfirmButton: false,
              timer: 2000,
            });
            detectLocalIP();
          }
        }
      } catch (error) {
        console.error("❌ Firestore error:", error);
        if (!ignore) {
          setIsOnline(false);
          detectLocalIP();
        }
      }
    };

    checkUserOnlineStatus();

    return () => {
      ignore = true;
    };
  }, []);

  return { isOnline, localIP };
};
