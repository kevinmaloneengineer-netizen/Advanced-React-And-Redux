import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { signin } from "actions";
import AuthForm from "components/auth/AuthForm";

const Signin = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const errorMessage = useSelector((state) => state.auth.errorMessage);

    function onSubmit(formProps) {
        dispatch(signin(formProps, () => navigate("/feature")));
    }

    return <AuthForm onSubmit={onSubmit} errorMessage={errorMessage} buttonText="Sign In!" />;
};

export default Signin;
