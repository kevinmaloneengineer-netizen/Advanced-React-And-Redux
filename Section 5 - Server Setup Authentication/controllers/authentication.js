const jwt = require("jsonwebtoken");
const User = require("../models/user");
const config = require("../config");

function tokenForUser(user) {
    // sub = subject (who the token belongs to); iat is added automatically
    return jwt.sign({ sub: user.id }, config.secret, { expiresIn: "7d" });
}

exports.signin = (req, res) => {
    // Passport's local strategy already checked email/password and set req.user
    res.send({ token: tokenForUser(req.user) });
};

exports.signup = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(422).send({ error: "You must provide email and password" });
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
        return res.status(422).send({ error: "Email is in use" });
    }

    const user = await User.create({ email, password });
    res.send({ token: tokenForUser(user) });
};
