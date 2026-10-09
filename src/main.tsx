import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import WinteresApp from "./app/WinteresApp";
import "./styles/global.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <WinteresApp />
  </StrictMode>,
);
