import axios from "axios";
import { AUTH_USER, AUTH_ERROR } from "actions/types";

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:3090";

// Thunk: returns a function; redux-thunk calls it with dispatch
export const signup = (formProps, callback) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_URL}/signup`, formProps);

        dispatch({ type: AUTH_USER, payload: response.data.token });
        localStorage.setItem("token", response.data.token);
        callback();
    } catch (e) {
        const message = e.response?.data?.error || "Email in use";
        dispatch({ type: AUTH_ERROR, payload: message });
    }
};

export const signin = (formProps, callback) => async (dispatch) => {
    try {
        const response = await axios.post(`${API_URL}/signin`, formProps);

        dispatch({ type: AUTH_USER, payload: response.data.token });
        localStorage.setItem("token", response.data.token);
        callback();
    } catch (e) {
        dispatch({ type: AUTH_ERROR, payload: "Invalid login credentials" });
    }
};

export const signout = () => {
    localStorage.removeItem("token");

    return {
        type: AUTH_USER,
        payload: "",
    };
};
