import React from "react";
import { Routes, Route } from "react-router-dom";
import TestComponent from "./pages/TestComponent";

function App() {
  return (
    <Routes>
      {/* Root route */}
      <Route path="/" element={<TestComponent />} />

      {/* NGOs route */}
      <Route path="/ngos" element={<TestComponent />} />

      {/* Fallback route */}
      <Route path="*" element={<h1>404 Not Found</h1>} />
    </Routes>
  );
}

export default App;
