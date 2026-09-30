import React from "react";
import { Routes, Route } from "react-router-dom";
import Header from "components/Header";
import Welcome from "components/Welcome";
import Feature from "components/Feature";
import Signup from "components/auth/Signup";
import Signin from "components/auth/Signin";
import Signout from "components/auth/Signout";

const App = () => {
    return (
        <div>
            <Header />
            <Routes>
                <Route path="/" element={<Welcome />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/signin" element={<Signin />} />
                <Route path="/signout" element={<Signout />} />
                <Route path="/feature" element={<Feature />} />
            </Routes>
        </div>
    );
};

export default App;
