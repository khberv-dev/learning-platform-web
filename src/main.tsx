
import React, { useEffect } from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { UiProvider } from "./state/ui";
import { useAuth } from "./state/auth";
import SvgSprite from "./components/SvgSprite";


function AuthBootstrap() {
  const restore = useAuth((s) => s.restore);

  useEffect(() => {
    restore();
  }, [restore]);

  return null;
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UiProvider>
      <BrowserRouter>
      <SvgSprite />
      <AuthBootstrap />
        <App />
      </BrowserRouter>
    </UiProvider>
  </React.StrictMode>
);