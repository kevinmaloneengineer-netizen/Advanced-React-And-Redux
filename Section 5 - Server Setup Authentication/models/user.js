const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    email: { type: String, unique: true, lowercase: true, required: true },
    password: { type: String, required: true },
});

// Before saving, replace the plain text password with a salted hash
userSchema.pre("save", async function () {
    if (!this.isModified("password")) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.comparePassword = function (candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model("user", userSchema);
