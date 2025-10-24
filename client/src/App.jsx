import React from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Home from "./pages/Home";
import NGO_Listings from "./pages/NGO_Listings";
import NGO_Details from "./pages/NGO_Details";
import Add_NGO from "./pages/Add_NGO";
import Dashboard from "./Dashboard/Dashboard";
import UserDashboard from "./Dashboard/UserDashboard";
import CreateEvent from "./pages/CreateEvent";
import * as Sentry from "@sentry/react";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("cc_token");
  return token ? children : <Navigate to="/login" />;
};


const OrganizerRoute = ({ children }) => {
  const token = localStorage.getItem("cc_token");
  if (!token) return <Navigate to="/login" />;

  let role = null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    role = payload.role;
  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/login" />;
  }

  return role === "organizer" ? children : <Navigate to="/" />;
};


const UserRoute = ({ children }) => {
  const token = localStorage.getItem("cc_token");
  if (!token) return <Navigate to="/login" />;

  let role = null;
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    role = payload.role;
  } catch (err) {
    console.error("Invalid token:", err);
    return <Navigate to="/login" />;
  }

  return role === "user" ? children : <Navigate to="/" />;
};

function App() {
  const token = localStorage.getItem("cc_token");
  let user = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      user = payload; 
    } catch (err) {
      console.error("Invalid token:", err);
    }
  }

  return (
    <Sentry.ErrorBoundary fallback={<p>Something went wrong.</p>}>
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={token ? <Navigate to="/" /> : <Login />} />
        <Route path="/signup" element={token ? <Navigate to="/" /> : <Signup />} />
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
              <NGO_Details user={user} />
            </PrivateRoute>
          }
        />
        <Route
          path="/add-ngo"
          element={
            <OrganizerRoute>
              <Add_NGO />
            </OrganizerRoute>
          }
        />
        <Route
          path="/edit-ngo/:id"
          element={
            <OrganizerRoute>
              <Add_NGO />
            </OrganizerRoute>
          }
        />

       
        <Route
          path="/dashboard/*"
          element={
            <OrganizerRoute>
              <Dashboard role={user?.role} />
            </OrganizerRoute>
          }
        />

      
        <Route
          path="/user-dashboard/*"
          element={
            <UserRoute>
              <UserDashboard />
            </UserRoute>
          }
        />

      
        <Route
          path="/dashboard/events/create/:ngoId"
          element={
            <OrganizerRoute>
              <CreateEvent />
            </OrganizerRoute>
          }
        />

   
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
    </Sentry.ErrorBoundary>
  );
}

export default App;
