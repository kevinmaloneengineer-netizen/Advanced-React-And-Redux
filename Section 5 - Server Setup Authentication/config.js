// Secrets come from .env (never commit it). See .env.example.
if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is missing. Copy .env.example to .env and set it.");
}

module.exports = {
    secret: process.env.JWT_SECRET,
    mongoUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/auth",
    port: process.env.PORT || 3090,
};
