import React from "react";
import requireAuth from "components/requireAuth";

const Feature = () => {
    return <div>This is the feature!</div>;
};

export default requireAuth(Feature);
