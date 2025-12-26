import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import PersistentBackground from "@/components/PersistentBackground";
import "./components/index.css";
import { ToastProvider } from "./components/Toast";
import { PremiumProvider } from "./context/PremiumContext.jsx";

ReactDOM.createRoot(document.getElementById("root")).render(
  <ToastProvider>
    <PersistentBackground />
    <App />
  </ToastProvider>
);
