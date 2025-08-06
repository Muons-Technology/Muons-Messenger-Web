// src/hooks/useMemberCount.js
import { useEffect, useState } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../../../../backend/firebase.config"; 

const useMemberCount = (circleId) => {
  const [count, setCount] = useState(null);

  useEffect(() => {
    const fetchCount = async () => {
      if (!circleId) return;

      try {
        const snapshot = await getDocs(collection(db, "circles", circleId, "members"));
        setCount(snapshot.size);
      } catch (err) {
        console.error("Error fetching member count:", err);
        setCount(null);
      }
    };

    fetchCount();
  }, [circleId]);

  const label =
    count === null ? "..." : `${count} member${count !== 1 ? "s" : ""}`;

  return { count, label };
};

export default useMemberCount;
