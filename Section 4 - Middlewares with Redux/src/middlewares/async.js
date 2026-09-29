const asyncMiddleware = ({ dispatch }) => (next) => (action) => {
    // Payload is not a promise: nothing to wait for, pass it on
    if (!action.payload || !action.payload.then) {
        return next(action);
    }

    // Wait for the promise, then send a fresh action through every middleware again
    return action.payload.then((response) => {
        const newAction = { ...action, payload: response };
        dispatch(newAction);
    });
};

export default asyncMiddleware;
