
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./styles/global.css";
import { UiProvider } from "./state/ui";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <UiProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </UiProvider>
  </React.StrictMode>
);