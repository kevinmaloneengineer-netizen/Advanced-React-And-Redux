import React, { useEffect } from "react";
import { connect } from "react-redux";
import { useNavigate } from "react-router-dom";

const requireAuth = (ChildComponent) => {
    const ComposedComponent = (props) => {
        const navigate = useNavigate();

        // Runs on first render and whenever auth changes (e.g. user signs out on this page)
        useEffect(() => {
            if (!props.auth) {
                navigate("/");
            }
        }, [props.auth, navigate]);

        return <ChildComponent {...props} />;
    };

    function mapStateToProps(state) {
        return { auth: state.auth };
    }

    return connect(mapStateToProps)(ComposedComponent);
};

export default requireAuth;
