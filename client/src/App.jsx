// client/src/App.jsx
import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NGO_Listings from "./pages/NGO_Listings";
import NGO_Details from "./pages/NGO_Details";

// PrivateRoute protects pages that need authentication
const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("cc_token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} /> {/* Home is public and first visible */}
        <Route
          path="/login"
          element={
            localStorage.getItem("cc_token") ? <Navigate to="/" /> : <Login />
          }
        />
        <Route
          path="/signup"
          element={
            localStorage.getItem("cc_token") ? <Navigate to="/" /> : <Signup />
          }
        />

        {/* Protected Routes */}
        <Route
          path="/ngos"
          element={
            <PrivateRoute>
              <NGO_Listings />
            </PrivateRoute>
          }
        />
        <Route
          path="/ngo/:id"
          element={
            <PrivateRoute>
              <NGO_Details />
            </PrivateRoute>
          }
        />

        {/* Fallback Route */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;
