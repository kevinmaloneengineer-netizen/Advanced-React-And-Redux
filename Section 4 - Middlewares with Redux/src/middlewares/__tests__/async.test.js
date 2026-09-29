import asyncMiddleware from "middlewares/async";

let dispatch;
let next;

beforeEach(() => {
    dispatch = jest.fn();
    next = jest.fn();
});

it("passes actions without a promise payload straight to next", () => {
    const action = { type: "plain", payload: "hello" };

    asyncMiddleware({ dispatch })(next)(action);

    expect(next).toHaveBeenCalledWith(action);
    expect(dispatch).not.toHaveBeenCalled();
});

it("waits for a promise payload, then dispatches a new action with the result", async () => {
    const action = { type: "fetch", payload: Promise.resolve({ data: [1, 2] }) };

    await asyncMiddleware({ dispatch })(next)(action);

    expect(next).not.toHaveBeenCalled();
    expect(dispatch).toHaveBeenCalledWith({ type: "fetch", payload: { data: [1, 2] } });
});
