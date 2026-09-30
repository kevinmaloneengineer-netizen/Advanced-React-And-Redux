const passport = require("passport");
const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");
const LocalStrategy = require("passport-local");
const User = require("../models/user");
const config = require("../config");

// Local strategy: sign in with email + password
const localLogin = new LocalStrategy({ usernameField: "email" }, async (email, password, done) => {
    try {
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) return done(null, false);

        const isMatch = await user.comparePassword(password);
        if (!isMatch) return done(null, false);

        return done(null, user);
    } catch (err) {
        return done(err);
    }
});

// JWT strategy: the token is sent as-is in the "authorization" header
const jwtOptions = {
    jwtFromRequest: ExtractJwt.fromHeader("authorization"),
    secretOrKey: config.secret,
};

const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
    try {
        const user = await User.findById(payload.sub);
        return done(null, user || false);
    } catch (err) {
        return done(err, false);
    }
});

passport.use(jwtLogin);
passport.use(localLogin);
