const { test, before, after, beforeEach } = require("node:test");
const assert = require("node:assert");
const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");
const request = require("supertest");

process.env.NODE_ENV = "test";
process.env.JWT_SECRET = "test-secret";

const app = require("../app");
const User = require("../models/user");

let mongo;

before(async () => {
    mongo = await MongoMemoryServer.create();
    await mongoose.connect(mongo.getUri());
});

after(async () => {
    await mongoose.disconnect();
    await mongo.stop();
});

beforeEach(async () => {
    await User.deleteMany({});
});

const creds = { email: "Test@Example.com", password: "secret123" };

test("signup returns a token and stores a hashed, lowercased user", async () => {
    const res = await request(app).post("/signup").send(creds).expect(200);
    assert.ok(res.body.token);

    const user = await User.findOne({ email: "test@example.com" });
    assert.ok(user);
    assert.notStrictEqual(user.password, creds.password);
});

test("signup rejects missing fields and duplicate emails", async () => {
    await request(app).post("/signup").send({ email: "a@b.com" }).expect(422);

    await request(app).post("/signup").send(creds).expect(200);
    const res = await request(app).post("/signup").send(creds).expect(422);
    assert.strictEqual(res.body.error, "Email is in use");
});

test("signin returns a token only for the right password", async () => {
    await request(app).post("/signup").send(creds).expect(200);

    const res = await request(app).post("/signin").send(creds).expect(200);
    assert.ok(res.body.token);

    await request(app).post("/signin").send({ ...creds, password: "wrong" }).expect(401);
    await request(app).post("/signin").send({ email: "nobody@x.com", password: "x" }).expect(401);
});

test("GET / requires a valid token", async () => {
    await request(app).get("/").expect(401);
    await request(app).get("/").set("authorization", "garbage").expect(401);

    const { body } = await request(app).post("/signup").send(creds).expect(200);
    const res = await request(app).get("/").set("authorization", body.token).expect(200);
    assert.deepStrictEqual(res.body, { hi: "there" });
});
