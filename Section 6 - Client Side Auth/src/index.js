import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import Root from "Root";
import App from "components/App";

const root = createRoot(document.querySelector("#root"));
root.render(
    <Root>
        <BrowserRouter>
            <App />
        </BrowserRouter>
    </Root>
);
