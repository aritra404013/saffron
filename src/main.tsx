import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";
import SecurityGate from "./components/SecurityGate.tsx";
import axios from "axios";

export const BASE_URL = "https://baculiform-hypnotically-noah.ngrok-free.dev";

// Required to bypass ngrok browser warning page on all requests
axios.defaults.headers.common["ngrok-skip-browser-warning"] = "true";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <SecurityGate>
      <GoogleOAuthProvider clientId="479250055112-oj3mm83cqsb2all7mjfb12prhvg2nmeq.apps.googleusercontent.com">
        <AppProvider>
          <SocketProvider>
            <App />
          </SocketProvider>
        </AppProvider>
      </GoogleOAuthProvider>
    </SecurityGate>
  </StrictMode>
);
