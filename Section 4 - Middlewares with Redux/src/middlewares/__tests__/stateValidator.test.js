import stateValidator from "middlewares/stateValidator";

let warn;

beforeEach(() => {
    warn = jest.spyOn(console, "warn").mockImplementation(() => {});
});

afterEach(() => {
    warn.mockRestore();
});

function run(state) {
    const next = jest.fn();
    const action = { type: "any" };

    stateValidator({ getState: () => state })(next)(action);

    expect(next).toHaveBeenCalledWith(action);
}

it("stays quiet when the state matches the schema", () => {
    run({ comments: ["one", "two"], auth: true });
    expect(warn).not.toHaveBeenCalled();
});

it("warns when a comment is not a string", () => {
    run({ comments: [{ name: "oops" }], auth: false });
    expect(warn).toHaveBeenCalledWith("Invalid state schema detected", expect.any(Array));
});

it("warns when auth is not a boolean", () => {
    run({ comments: [], auth: "yes" });
    expect(warn).toHaveBeenCalled();
});
