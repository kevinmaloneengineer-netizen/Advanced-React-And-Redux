import React, { useState } from "react";

// Shared email/password form for Signup and Signin (replaces redux-form)
const AuthForm = ({ onSubmit, errorMessage, buttonText }) => {
    const [formProps, setFormProps] = useState({ email: "", password: "" });

    function handleChange(event) {
        setFormProps({ ...formProps, [event.target.name]: event.target.value });
    }

    function handleSubmit(event) {
        event.preventDefault();
        onSubmit(formProps);
    }

    return (
        <form onSubmit={handleSubmit}>
            <fieldset>
                <label htmlFor="email">Email</label>
                <input
                    id="email"
                    name="email"
                    type="text"
                    autoComplete="none"
                    value={formProps.email}
                    onChange={handleChange}
                />
            </fieldset>
            <fieldset>
                <label htmlFor="password">Password</label>
                <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete="none"
                    value={formProps.password}
                    onChange={handleChange}
                />
            </fieldset>
            <div role="alert">{errorMessage}</div>
            <button>{buttonText}</button>
        </form>
    );
};

export default AuthForm;
