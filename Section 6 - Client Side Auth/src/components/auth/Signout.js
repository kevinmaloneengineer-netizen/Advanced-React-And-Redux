import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { signout } from "actions";

const Signout = () => {
    const dispatch = useDispatch();

    // Sign out automatically as soon as this page is shown
    useEffect(() => {
        dispatch(signout());
    }, [dispatch]);

    return <div>Sorry to see you go</div>;
};

export default Signout;
