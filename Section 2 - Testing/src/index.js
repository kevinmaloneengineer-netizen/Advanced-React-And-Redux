import React from "react";
import { createRoot } from "react-dom/client";
import App from "components/App";
import Root from "Root";

const root = createRoot(document.querySelector("#root"));
root.render(
    <Root>
        <App />
    </Root>
);
