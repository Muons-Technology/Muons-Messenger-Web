import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../../backend/firebase.config";
import { doc, getDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import Swal from "sweetalert2";
import muons from "../assets/images/background.png";
import logo from "../assets/images/rebrand.png";
import { useOfflineAuth } from "../hooks/hooks_auth/useOfflineAuth";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const { saveOfflineUser, tryOfflineLogin } = useOfflineAuth(); // ✅ Hook in use

  const BACKEND_URL =
    process.env.NODE_ENV === "development"
      ? "http://localhost:5050"
      : "https://9ddd-102-89-44-62.ngrok-free.app";

  const pingTailscaleIP = async (ip) => {
    try {
      const res = await fetch(`${BACKEND_URL}/ping?ip=${ip}`);
      if (!res.ok) throw new Error("Ping failed with status " + res.status);
      await res.json();
      return true;
    } catch (err) {
      console.error("Ping failed:", err);
      return false;
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        setError("User profile not found.");
        setLoading(false);
        return;
      }

      saveOfflineUser(email, password); // ✅ Save for offline use

      const { value: tailscaleIP } = await Swal.fire({
        title: "Enter your Tailscale IP (optional)",
        input: "text",
        inputPlaceholder: "e.g., 100.x.x.x",
        inputValue: "",
        confirmButtonText: "Continue",
        showCancelButton: true,
        allowOutsideClick: false,
      });

      let isTailscaleActive = false;
      let ipToSave = "Unavailable";

      if (tailscaleIP) {
        const pingSuccess = await pingTailscaleIP(tailscaleIP);
        isTailscaleActive = pingSuccess;

        if (pingSuccess) {
          ipToSave = tailscaleIP;
        }

        await Swal.fire({
          icon: pingSuccess ? "success" : "warning",
          title: pingSuccess ? "Tailscale is active ✅" : "Tailscale not connected ⚠️",
          text: pingSuccess
            ? "We successfully reached your Tailscale node."
            : "Could not reach your Tailscale IP. Please make sure it’s online.",
          showConfirmButton: true,
          timer: 5000,
          timerProgressBar: true,
          confirmButtonText: "OK",
          allowOutsideClick: false,
        });
      }

      await updateDoc(userDocRef, {
        isOnline: true,
        lastSeen: serverTimestamp(),
        tailscaleIP: ipToSave,
        isTailscaleActive,
      });

      const userData = userDoc.data();
      await Swal.fire({
        title: `Welcome, ${userData.firstName}!`,
        text: "You're successfully logged into Muons Messenger 🎉",
        icon: "success",
        confirmButtonColor: "#000",
      });

      navigate("/dashboard");
    } catch (err) {
      console.error("Firebase login failed:", err);

      // ✅ Try offline fallback
      const offlineUser = tryOfflineLogin(email, password);
      if (offlineUser) {
        await Swal.fire({
          title: "Offline Mode 🌐",
          text: "You’re now using offline mode. Some features may be limited.",
          icon: "info",
          confirmButtonColor: "#000",
        });

        navigate("/dashboard");
      } else {
        setError("Invalid email or password.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Left Section */}
      <div
        className="w-2/3 hidden md:block relative"
        style={{
          backgroundImage: `url(${muons})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8 text-white">
          <div className="text-center mt-80">
            <h1 className="text-4xl font-bold mb-4">Welcome to Muons Messenger</h1>
            <p className="text-lg max-w-md mx-auto">
              Connect. Collaborate. Communicate. Your journey begins here.
            </p>
          </div>
          <div className="text-center text-sm opacity-90 mb-4">
            <p>Empowering seamless communication, one message at a time.</p>
          </div>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-50">
        <div className="w-full max-w-sm p-8">
          <div className="flex justify-center mb-6">
            <img src={logo} alt="Muons Logo" className="h-16" />
          </div>

          <h2 className="text-3xl font-bold text-center text-gray-900">Welcome Back</h2>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

          <form onSubmit={handleLogin} className="mt-8 space-y-6">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full py-2 rounded-md transition ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-black text-white hover:bg-gray-700"
                }`}
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <svg
                      className="animate-spin h-5 w-5 mr-2 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                      ></path>
                    </svg>
                    Signing In...
                  </div>
                ) : (
                  "Sign in"
                )}
              </button>
            </div>
          </form>

          <p className="mt-6 text-center text-sm text-gray-500">
            Not a member?{" "}
            <Link to="/signup" className="text-black hover:underline">
              Register here
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;
