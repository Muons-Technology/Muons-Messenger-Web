import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { onAuthStateChanged } from "firebase/auth";
import { doc, updateDoc } from "firebase/firestore";

import { auth, db } from "../backend/firebase.config";

//importing the splash screen
import SplashScreen from "./components/splashscreen/SplashScreen";

//importing authentication
import SignUp from "./authentication/SignUp";
import Login from "./authentication/Login";

//importing the pages
import ChatBox from "./pages/ChatsBox";

function App() {
  useEffect(() => {
    let unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userRef = doc(db, "users", user.uid);

        // Set isOnline to true when user is logged in
        await updateDoc(userRef, { isOnline: true });

        // When user closes tab or browser, set isOnline to false
        const handleBeforeUnload = async () => {
          await updateDoc(userRef, { isOnline: false });
        };

        window.addEventListener("beforeunload", handleBeforeUnload);

        // Cleanup listener when user logs out or component unmounts
        return () => {
          window.removeEventListener("beforeunload", handleBeforeUnload);
          updateDoc(userRef, { isOnline: false }); // also set offline on cleanup
        };
      }
    });

    // Cleanup auth listener on unmount
    return () => unsubscribeAuth();
  }, []);

  return (
    <Router>
      <Routes>
        {/* Splash screen */}
        <Route path="/" element={<SplashScreen />} />
        {/* main pages */}
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<ChatBox />} />

      </Routes>
    </Router>
  );
}

export default App;
