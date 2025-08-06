import { useEffect, useState } from "react";
import { IoPersonCircleOutline } from "react-icons/io5";
import { updateDoc, doc, arrayRemove } from "firebase/firestore";
import { db, auth } from "../../../../backend/firebase.config";
import useMemberCount from "../../../hooks/hooks_tabs/hooks_circles/useMemberCount";

const CircleList = ({ circles, setCircles, onCircleClick }) => {
  const currentUid = auth.currentUser?.uid;

  const handleLeave = async (circleId) => {
    if (!currentUid) return;

    try {
      await updateDoc(doc(db, "circles", circleId), {
        members: arrayRemove(currentUid),
      });

      // Optional: delete member subdocument if used
      // await deleteDoc(doc(db, "circles", circleId, "members", currentUid));

      setCircles((prev) => prev.filter((c) => c.id !== circleId));
    } catch (err) {
      console.error("Failed to leave circle:", err);
      alert("Error leaving circle");
    }
  };

  return (
    <>
      {circles.map((circle) => {
        const { label } = useMemberCount(circle.id); // hook returns formatted count label

        return (
          <li
            key={circle.id}
            onClick={() => onCircleClick && onCircleClick(circle)}
            className="bg-gray-800 px-4 py-3 rounded-lg shadow-sm hover:bg-gray-700 flex items-center justify-between transition duration-150 ease-in-out cursor-pointer group"
          >
            <div className="flex items-center space-x-3">
              <IoPersonCircleOutline className="text-3xl text-gray-400 group-hover:text-white transition" />
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-gray-100">
                  {circle.name || "Unnamed Circle"}
                </span>
                <span className="text-xs text-gray-400">{label}</span>
              </div>
            </div>

            {circle.createdBy !== currentUid && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleLeave(circle.id);
                }}
                className="text-sm px-3 py-1 bg-red-600 hover:bg-red-500 rounded-full"
              >
                Leave
              </button>
            )}
          </li>
        );
      })}
    </>
  );
};

export default CircleList;
