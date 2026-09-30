const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const router = require("./router");

const app = express();

if (process.env.NODE_ENV !== "test") {
    app.use(morgan("combined"));
}
// Allow the React client (another origin, e.g. localhost:3000) to call this API
app.use(cors());
app.use(express.json({ type: "*/*" }));
router(app);

module.exports = app;
