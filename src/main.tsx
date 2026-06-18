import React from "react";
import ReactDOM from "react-dom/client";
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "./styles/app.css";
import { App } from "./app/App";
import { ensureSeed } from "./data/seed";
import { applyStoredTheme } from "./store/ui";

applyStoredTheme();

ensureSeed().then(() => {
  ReactDOM.createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
});
