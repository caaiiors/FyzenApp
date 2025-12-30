import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import FacebookLandingPage from "./screens/FacebookLandingPage";
import PersistentBackground from "@/components/PersistentBackground";
import "./components/index.css";
import { ToastProvider } from "./components/Toast";

const root = ReactDOM.createRoot(document.getElementById("root"));

// Renderiza baseado na rota
if (window.location.pathname === "/facebook") {
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <FacebookLandingPage />
      </ToastProvider>
    </React.StrictMode>
  );
} else {
  root.render(
    <React.StrictMode>
      <ToastProvider>
        <PersistentBackground />
        <App />
      </ToastProvider>
    </React.StrictMode>
  );
}
