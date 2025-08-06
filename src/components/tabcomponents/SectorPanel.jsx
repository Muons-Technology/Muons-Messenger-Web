import { useEffect, useState } from "react";
import {
  doc,
  onSnapshot,
  collection,
  query,
  where,
  getDocs,
  getDoc,
} from "firebase/firestore";
import { db, auth } from "../../../backend/firebase.config";
import { FiPlus } from "react-icons/fi";
import NewCirclePage from "./circlecomponents/NewCirclePage";
import CircleList from "./circlecomponents/CircleList";
import CircleWindow from "./circlecomponents/circlewindow/CircleWindow";

const SectorPanel = () => {
  const [userData, setUserData] = useState(null);
  const [circles, setCircles] = useState([]);
  const [showNewCircleSidebar, setShowNewCircleSidebar] = useState(false);
  const [selectedCircle, setSelectedCircle] = useState(null);

  // Fetch user data
  useEffect(() => {
    const currentUser = auth.currentUser;
    if (!currentUser) return;

    const userRef = doc(db, "users", currentUser.uid);
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        setUserData(docSnap.data());
      }
    });

    return () => unsubscribe();
  }, []);

  // Fetch circles (created and member)
  useEffect(() => {
    const fetchCircles = async () => {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const uid = currentUser.uid;

      const createdQuery = query(
        collection(db, "circles"),
        where("createdBy", "==", uid)
      );
      const createdSnap = await getDocs(createdQuery);

      // Now check all circle docs to find where the user is in `members` subcollection
      const circlesCol = collection(db, "circles");
      const allCirclesSnap = await getDocs(circlesCol);

      const memberCircles = [];

      for (const docSnap of allCirclesSnap.docs) {
        const memberDocRef = doc(db, `circles/${docSnap.id}/members/${uid}`);
        const memberDocSnap = await getDoc(memberDocRef);
        if (memberDocSnap.exists()) {
          memberCircles.push({ id: docSnap.id, ...docSnap.data() });
        }
      }

      // Merge and remove duplicates
      const allCircles = [...createdSnap.docs, ...memberCircles];
      const uniqueMap = {};
      allCircles.forEach((doc) => {
        if (doc?.id && doc?.data) {
          uniqueMap[doc.id] = { id: doc.id, ...(doc.data?.() || doc) };
        } else {
          uniqueMap[doc.id] = doc; // handles memberCircles manually pushed
        }
      });

      setCircles(Object.values(uniqueMap));
    };

    fetchCircles();
  }, []);

  const userSector = userData?.position || "Your";

  const handleCircleClick = (circle) => {
    setSelectedCircle(circle);
  };

  const handleNewCircleClose = () => {
    setShowNewCircleSidebar(false);
  };

  const handleCircleWindowClose = () => {
    setSelectedCircle(null);
  };

  return (
    <div className="relative p-4 text-gray-200">
      {/* Header */}
      <h2 className="text-lg font-semibold mb-4">{`${userSector} Circles`}</h2>

      {/* New Circle Button */}
      <ul className="space-y-3">
        <li
          className="bg-gray-800 px-4 py-3 rounded-lg shadow-sm flex items-center justify-between hover:bg-gray-700 cursor-pointer"
          onClick={() => setShowNewCircleSidebar(true)}
        >
          <div className="flex items-center space-x-3">
            <span className="text-lg">💼</span>
            <span className="text-sm font-medium text-gray-200">
              New Circle
            </span>
          </div>
          <FiPlus className="text-xl text-white hover:text-green-400" />
        </li>

        {/* Circle List */}
        <CircleList
          circles={circles}
          onCircleClick={handleCircleClick}
          setCircles={setCircles}
        />
      </ul>

      {/* New Circle Sidebar */}
      {showNewCircleSidebar && (
        <div className="fixed top-0 left-0 h-full w-full sm:w-[420px] bg-gray-900 shadow-lg z-50 transition-all duration-300 ease-in-out">
          <NewCirclePage onClose={handleNewCircleClose} />
        </div>
      )}

      {/* Circle Window (right side) */}
      {selectedCircle && (
        <div className="fixed top-0 right-0 h-full w-full sm:w-[1259px] bg-gray-950 text-white z-50 shadow-lg transition-transform duration-300 ease-in-out">
          <CircleWindow
            circle={selectedCircle}
            onClose={handleCircleWindowClose}
          />
        </div>
      )}

      <div>
        <h2 style={{ fontWeight: "bold", marginTop: "400px" }}>
          General Circles
        </h2>
      </div>
    </div>
  );
};

export default SectorPanel;
