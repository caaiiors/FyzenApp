import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import App from "./App";
import FacebookLandingPage from "./screens/FacebookLandingPage";
import PersistentBackground from "@/components/PersistentBackground";
import "./components/index.css";
import { ToastProvider } from "./components/Toast";
import { PremiumProvider } from "./context/PremiumContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <Router>
    <ToastProvider>
      <PersistentBackground />
      <Routes>
        <Route path="/facebook" element={<FacebookLandingPage />} />
        <Route path="/*" element={<App />} />
      </Routes>
    </ToastProvider>
  </Router>
);
