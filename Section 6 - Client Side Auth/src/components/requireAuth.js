import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Same HOC as Section 3, now reading the token from state.auth.authenticated
const requireAuth = (ChildComponent) => {
    const ComposedComponent = (props) => {
        const auth = useSelector((state) => state.auth.authenticated);
        const navigate = useNavigate();

        useEffect(() => {
            if (!auth) {
                navigate("/");
            }
        }, [auth, navigate]);

        return <ChildComponent {...props} />;
    };

    return ComposedComponent;
};

export default requireAuth;
