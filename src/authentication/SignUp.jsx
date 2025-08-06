import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { db } from "../../backend/firebase.config";
import Swal from "sweetalert2";
import muons from "../assets/images/background.png";

function SignUp() {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    firstName: "",
    lastName: "",
    email: "",
    position: "",
    country: "United States",
    password: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { email, password, confirmPassword, firstName } = formData;

    if (password !== confirmPassword) {
      setLoading(false);
      return setError("Passwords do not match.");
    }

    try {
      const auth = getAuth();
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: formData.username,
        firstName,
        lastName: formData.lastName,
        email,
        country: formData.country,
        position: formData.position,
      });

      Swal.fire({
        title: `Welcome, ${firstName}!`,
        text: "Your registration was successful 🎉",
        icon: "success",
        confirmButtonColor: "#000",
      }).then(() => {
        navigate("/login");
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-screen">
      {/* Left: Sign Up Form */}
      <div className="w-full md:w-2/3 flex items-center justify-center bg-gray-50 p-4">
        <div className="w-full max-w-md p-8">
          <h2 className="text-3xl font-bold text-center text-gray-900">Create Account</h2>
          {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

          <form onSubmit={handleSubmit} className="mt-8 space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                Username
              </label>
              <input
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                placeholder="janesmith"
              />
            </div>

            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-gray-700">
                First name
              </label>
              <input
                type="text"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                placeholder="Enter your first name"
              />
            </div>

            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-gray-700">
                Last name
              </label>
              <input
                type="text"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                placeholder="Enter your last name"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                placeholder="Enter your email"
              />
            </div>

            {/* 🔁 Sector Dropdown */}
            <div>
              <label htmlFor="position" className="block text-sm font-medium text-gray-700">
                Sector / Category
              </label>
              <select
                name="position"
                value={formData.position}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
              >
                <option value="">Select a sector</option>
                <option value="Education">Education</option>
                <option value="Mining">Mining</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Technology">Technology</option>
                <option value="Agriculture">Agriculture</option>
              </select>
            </div>

            <div>
              <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                Country
              </label>
              <select
                name="country"
                value={formData.country}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
              >
                <option>United States</option>
                <option>Canada</option>
                <option>Mexico</option>
              </select>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                placeholder="Enter your password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-black-500"
                placeholder="Confirm your password"
              />
            </div>

            <div className="mt-6">
              <button
                type="submit"
                className={`w-full py-2 rounded-md transition ${
                  loading ? "bg-gray-400 cursor-not-allowed" : "bg-black text-white hover:bg-gray-500"
                }`}
                disabled={loading}
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
                    Signing Up...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <Link to="/login" className="text-black hover:underline">
                Login here
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right: Image */}
      <div
        className="w-full md:w-2/3 hidden md:block relative"
        style={{
          backgroundImage: `url(${muons})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          height: "100%",
        }}
      >
        <div className="absolute inset-0 bg-black/50 flex flex-col justify-between p-8 text-white">
          <div className="text-center mt-80">
            <h1 className="text-4xl font-bold mb-4">Welcome to Muons Messenger</h1>
            <p className="text-lg max-w-md mx-auto">
              Create, Connect, communicate and collaborate with people
            </p>
          </div>
          <div className="text-center text-sm opacity-90 mb-4">
            <p>Empowering seamless communication, one message at a time.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SignUp;
