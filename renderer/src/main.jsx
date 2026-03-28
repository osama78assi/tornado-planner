import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";
import { BrowserRouter } from "react-router-dom";
import { getSettings } from "./util/main.js";
import { getConstants } from "./util/constants.js";

async function main() {
    // Get the application constants
    await getConstants();
    
    // Get the application settings
    await getSettings();


    // Create the root
    createRoot(document.getElementById("root")).render(
        <BrowserRouter>
            <App />
        </BrowserRouter>,
    );
}

main();
