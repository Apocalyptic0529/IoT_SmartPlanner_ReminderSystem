import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import "./lib/notifications";

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(
      (registration) => {
        console.log("SW registered: ", registration);
      },
      (registrationError) => {
        console.log("SW registration failed: ", registrationError);
      }
    );
  });
}

// Request notification permission early
if ('Notification' in window && Notification.permission === 'default') {
  Notification.requestPermission();
}

createRoot(document.getElementById("root")!).render(<App />);
