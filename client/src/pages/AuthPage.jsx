// src/pages/AuthPage.jsx
import React, { useState } from "react";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { useNavigate } from "react-router-dom";
import { auth } from "../firebase-config";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://srnqvdmvvywbtlhnxetu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybnF2ZG12dnl3YnRsaG54ZXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTMyMjAsImV4cCI6MjA3NDg4OTIyMH0.Z4Li7Cnq7LqVVW9Kt-iNsj7pJtA-p5S7IEwrcS2KCoU"
);

function AuthPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  const signup = async () => {
    setError(null);
    if (!email || !password) {
      setError("Email and password cannot be empty");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await supabase.from("users").insert({
        email: user.email,
        firebase_uid: user.uid
      });

      navigate("/ngos");
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const login = async () => {
    setError(null);
    if (!email || !password) {
      setError("Email and password cannot be empty");
      return;
    }
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/ngos");
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  const signInWithGoogle = async () => {
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Insert into Supabase if not exists
      await supabase.from("users").upsert({
        email: user.email,
        firebase_uid: user.uid
      });

      navigate("/ngos");
    } catch (e) {
      console.error(e);
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-md">
        <h2 className="text-3xl font-semibold mb-6 text-center text-gray-800">Welcome</h2>

        {error && <p className="text-red-500 mb-4 text-center">{error}</p>}

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full p-3 mb-4 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
        />

        <div className="flex justify-between mb-4">
          <button
            onClick={signup}
            className="w-1/2 mr-2 bg-blue-600 text-white p-3 rounded hover:bg-blue-700 transition-colors"
          >
            Sign Up
          </button>
          <button
            onClick={login}
            className="w-1/2 ml-2 bg-green-600 text-white p-3 rounded hover:bg-green-700 transition-colors"
          >
            Log In
          </button>
        </div>

        <hr className="my-4 border-gray-300" />

        <button
          onClick={signInWithGoogle}
          className="w-full flex items-center justify-center bg-red-500 text-white p-3 rounded hover:bg-red-600 transition-colors"
        >
          Sign in with Google
        </button>
      </div>
    </div>
  );
}

export default AuthPage;
