// importing all things we need
import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App";

// css files
import "bootstrap/dist/css/bootstrap.min.css";
import "../src/style.css";

// connecting react to html root div
const container = document.getElementById("root");

// rendirectingg our main App inside StrictMode it helps to finfd small issues
createRoot(container).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
