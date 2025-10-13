// src/pages/CausePage.jsx
import React, { useState, useEffect } from "react";
import { createClient } from "@supabase/supabase-js";
import { gql, useQuery } from "@apollo/client";
import { signOut, onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebase-config";
import client from "../apolloClient"; // use admin-secret Apollo client
import TestComponent from "./TestComponent";

// Initialize Supabase client
const supabase = createClient(
  "https://srnqvdmvvywbtlhnxetu.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNybnF2ZG12dnl3YnRsaG54ZXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkzMTMyMjAsImV4cCI6MjA3NDg4OTIyMH0.Z4Li7Cnq7LqVVW9Kt-iNsj7pJtA-p5S7IEwrcS2KCoU"
);

// GraphQL query
const GET_NOTIFICATIONS = gql`
  query GetNotifications($userId: String!) {
    notifications(where: { user_id: { _eq: $userId } }) {
      id
      message
      cause {
        title
      }
    }
  }
`;

function CausePage() {
  const [title, setTitle] = useState("");
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Track Firebase user
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  // Only query notifications if userId exists
  const { data, loading, error: queryError, refetch } = useQuery(GET_NOTIFICATIONS, {
    variables: { userId },
    skip: !userId,
  });

  // Create a cause
  const createCause = async () => {
    try {
      if (!title) {
        setError("Title cannot be empty");
        return;
      }
      if (!userId) {
        setError("User not logged in");
        return;
      }

      const { data: causeData, error: causeError } = await supabase
        .from("causes")
        .insert({ title, creator_uid: userId })
        .select();

      if (causeError) throw causeError;

      // Optionally call Supabase Edge Function
      const edgeFunctionUrl = "https://srnqvdmvvywbtlhnxetu.supabase.co/functions/v1/on_cause_created";
      await fetch(edgeFunctionUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ creatorUid: userId, title }),
      });

      setTitle("");
      setError(null);
      refetch();
      alert("Cause created: " + causeData[0].title);
    } catch (e) {
      setError(e.message);
    }
  };

  const logout = async () => {
    await signOut(auth);
    setUserId(null);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-center">Causes & Notifications</h2>

      <button
        onClick={logout}
        className="mb-4 bg-red-500 text-white p-2 rounded hover:bg-red-600"
      >
        Log Out
      </button>

      {/* Test Apollo Connection */}
      <TestComponent />

      <div>
        <h3 className="text-xl font-semibold mb-2">Create Cause</h3>
        <input
          type="text"
          placeholder="Cause Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="w-full p-2 mb-4 border rounded"
        />
        <button
          onClick={createCause}
          className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
        >
          Create Cause
        </button>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-2">Notifications</h3>
        {loading && <p>Loading...</p>}
        {queryError && <p className="text-red-500">Error: {queryError.message}</p>}
        {!loading && !queryError && !data?.notifications?.length && <p>No notifications</p>}
        {data?.notifications && (
          <ul className="list-disc pl-5">
            {data.notifications.map((n) => (
              <li key={n.id} className="mb-2">
                {n.message} (Cause: {n.cause?.title || "Unknown"})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

export default CausePage;
