import React from "react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import { thunk } from "redux-thunk";
import reducers from "reducers";

// Read the saved token so a page refresh keeps the user signed in
function defaultInitialState() {
    return {
        auth: { authenticated: localStorage.getItem("token") || "", errorMessage: "" },
    };
}

const Root = ({ children, initialState = defaultInitialState() }) => {
    const store = createStore(reducers, initialState, applyMiddleware(thunk));

    return <Provider store={store}>{children}</Provider>;
};

export default Root;
