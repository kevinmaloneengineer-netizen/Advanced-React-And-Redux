import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import App from "components/App";
import Root from "Root";

jest.mock("components/CommentBox", () => () => <div data-testid="comment-box" />);
jest.mock("components/CommentList", () => () => <div data-testid="comment-list" />);

function renderAt(path, initialState = {}) {
    render(
        <Root initialState={initialState}>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </Root>
    );
}

it("shows a comment list at /", () => {
    renderAt("/");
    expect(screen.getAllByTestId("comment-list")).toHaveLength(1);
});

it("shows a comment box at /post", () => {
    renderAt("/post");
    expect(screen.getAllByTestId("comment-box")).toHaveLength(1);
});

it("toggles between Sign In and Sign Out", async () => {
    const user = userEvent.setup();
    renderAt("/");

    await user.click(screen.getByRole("button", { name: "Sign In" }));
    expect(screen.getByRole("button", { name: "Sign Out" })).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "Sign Out" }));
    expect(screen.getByRole("button", { name: "Sign In" })).toBeInTheDocument();
});
