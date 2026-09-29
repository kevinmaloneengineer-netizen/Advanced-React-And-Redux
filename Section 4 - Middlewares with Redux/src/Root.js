import React from "react";
import { Provider } from "react-redux";
import { legacy_createStore as createStore, applyMiddleware } from "redux";
import reducers from "reducers";
import asyncMiddleware from "middlewares/async";
import stateValidator from "middlewares/stateValidator";

const Root = ({ children, initialState = {} }) => {
    const store = createStore(
        reducers,
        initialState,
        applyMiddleware(asyncMiddleware, stateValidator)
    );

    return <Provider store={store}>{children}</Provider>;
};

export default Root;
