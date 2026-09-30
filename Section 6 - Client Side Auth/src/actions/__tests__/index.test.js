import axios from "axios";
import { signup, signin, signout } from "actions";
import { AUTH_USER, AUTH_ERROR } from "actions/types";

jest.mock("axios");

let dispatch;
let callback;

beforeEach(() => {
    dispatch = jest.fn();
    callback = jest.fn();
});

describe("signup", () => {
    it("saves the token, dispatches AUTH_USER and calls the callback", async () => {
        axios.post.mockResolvedValue({ data: { token: "abc" } });

        await signup({ email: "a@b.com", password: "123" }, callback)(dispatch);

        expect(axios.post).toHaveBeenCalledWith("http://localhost:3090/signup", { email: "a@b.com", password: "123" });
        expect(dispatch).toHaveBeenCalledWith({ type: AUTH_USER, payload: "abc" });
        expect(localStorage.getItem("token")).toBe("abc");
        expect(callback).toHaveBeenCalled();
    });

    it("dispatches the server's error message on failure", async () => {
        axios.post.mockRejectedValue({ response: { data: { error: "Email is in use" } } });

        await signup({ email: "a@b.com", password: "123" }, callback)(dispatch);

        expect(dispatch).toHaveBeenCalledWith({ type: AUTH_ERROR, payload: "Email is in use" });
        expect(callback).not.toHaveBeenCalled();
    });
});

describe("signin", () => {
    it("dispatches an error for bad credentials", async () => {
        axios.post.mockRejectedValue({ response: { status: 401 } });

        await signin({ email: "a@b.com", password: "wrong" }, callback)(dispatch);

        expect(dispatch).toHaveBeenCalledWith({ type: AUTH_ERROR, payload: "Invalid login credentials" });
    });
});

describe("signout", () => {
    it("removes the token and clears authenticated", () => {
        localStorage.setItem("token", "abc");

        expect(signout()).toEqual({ type: AUTH_USER, payload: "" });
        expect(localStorage.getItem("token")).toBeNull();
    });
});
