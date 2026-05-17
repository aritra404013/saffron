import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "material-symbols";
import App from "./App.tsx";
import { GoogleOAuthProvider } from "@react-oauth/google";
import { AppProvider } from "./context/AppContext.tsx";
import "leaflet/dist/leaflet.css";
import { SocketProvider } from "./context/SocketContext.tsx";

// Initialize axios defaults (BASE_URL now lives in config.ts)
import "./config";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <GoogleOAuthProvider clientId="479250055112-oj3mm83cqsb2all7mjfb12prhvg2nmeq.apps.googleusercontent.com">
      <AppProvider>
        <SocketProvider>
          <App />
        </SocketProvider>
      </AppProvider>
    </GoogleOAuthProvider>
  </StrictMode>
);
