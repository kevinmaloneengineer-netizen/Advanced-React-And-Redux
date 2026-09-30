import authReducer from "reducers/auth";
import { AUTH_USER, AUTH_ERROR } from "actions/types";

it("stores the token and clears errors on AUTH_USER", () => {
    const state = authReducer({ authenticated: "", errorMessage: "old" }, { type: AUTH_USER, payload: "abc" });
    expect(state).toEqual({ authenticated: "abc", errorMessage: "" });
});

it("stores the message on AUTH_ERROR", () => {
    const state = authReducer(undefined, { type: AUTH_ERROR, payload: "Email in use" });
    expect(state).toEqual({ authenticated: "", errorMessage: "Email in use" });
});
