import React from "react";
import { useSelector } from "react-redux";
import { Link } from "react-router-dom";
import "components/Header.css";

const Header = () => {
    const authenticated = useSelector((state) => state.auth.authenticated);

    function renderLinks() {
        if (authenticated) {
            return (
                <nav>
                    <Link to="/feature">Feature</Link>
                    <Link to="/signout">Sign Out</Link>
                </nav>
            );
        }

        return (
            <nav>
                <Link to="/signup">Sign Up</Link>
                <Link to="/signin">Sign In</Link>
            </nav>
        );
    }

    return (
        <div className="header">
            <Link to="/">Redux Auth</Link>
            {renderLinks()}
        </div>
    );
};

export default Header;
