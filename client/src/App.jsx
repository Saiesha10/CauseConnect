import React, { useState, useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { ApolloProvider } from "@apollo/client";
import client from "./apolloClient";
import AuthPage from "./pages/AuthPage";
import NGO_Listings from "./pages/NGO_Listings.jsx"; 
import NGO_Details from "./pages/NGO_Details.jsx";     
import Navbar from "./components/Navbar";
import { auth } from "./firebase-config";
import { onAuthStateChanged } from "firebase/auth";

// Protected Route
function ProtectedRoute({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  if (loading) return <p className="text-center mt-10">Loading...</p>;
  return user ? children : <Navigate to="/" />;
}

function App() {
  return (
    <ApolloProvider client={client}>
      <div className="min-h-screen bg-gray-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<AuthPage />} />
          <Route
            path="/ngos"
            element={
              <ProtectedRoute>
                <NGO_Listings />
              </ProtectedRoute>
            }
          />
          <Route
            path="/ngos/:id"
            element={
              <ProtectedRoute>
                <NGO_Details />
              </ProtectedRoute>
            }
          />
          <Route
            path="*"
            element={<h1 className="text-2xl text-center mt-10">404 Not Found</h1>}
          />
        </Routes>
      </div>
    </ApolloProvider>
  );
}

export default App;
