import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signup } from "actions";
import AuthForm from "components/auth/AuthForm";

const Signup = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const errorMessage = useSelector((state) => state.auth.errorMessage);

    function onSubmit(formProps) {
        dispatch(signup(formProps, () => navigate("/feature")));
    }

    return <AuthForm onSubmit={onSubmit} errorMessage={errorMessage} buttonText="Sign Up!" />;
};

export default Signup;
