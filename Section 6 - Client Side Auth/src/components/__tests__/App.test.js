import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import axios from "axios";
import Root from "Root";
import App from "components/App";

jest.mock("axios");

function renderAt(path) {
    render(
        <Root>
            <MemoryRouter initialEntries={[path]}>
                <App />
            </MemoryRouter>
        </Root>
    );
}

it("shows Sign Up / Sign In links when signed out", () => {
    renderAt("/");
    expect(screen.getByRole("link", { name: "Sign Up" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(screen.queryByRole("link", { name: "Feature" })).not.toBeInTheDocument();
});

it("keeps the user signed in after a refresh (token in localStorage)", () => {
    localStorage.setItem("token", "saved");
    renderAt("/feature");

    expect(screen.getByText("This is the feature!")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Sign Out" })).toBeInTheDocument();
});

it("redirects /feature to / when signed out", async () => {
    renderAt("/feature");
    expect(await screen.findByText(/welcome/i)).toBeInTheDocument();
});

it("signs up, then lands on /feature", async () => {
    const user = userEvent.setup();
    axios.post.mockResolvedValue({ data: { token: "new-token" } });
    renderAt("/signup");

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "123");
    await user.click(screen.getByRole("button", { name: "Sign Up!" }));

    expect(await screen.findByText("This is the feature!")).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBe("new-token");
});

it("shows the error message when sign in fails", async () => {
    const user = userEvent.setup();
    axios.post.mockRejectedValue({ response: { status: 401 } });
    renderAt("/signin");

    await user.type(screen.getByLabelText("Email"), "a@b.com");
    await user.type(screen.getByLabelText("Password"), "wrong");
    await user.click(screen.getByRole("button", { name: "Sign In!" }));

    expect(await screen.findByRole("alert")).toHaveTextContent("Invalid login credentials");
});

it("signs out automatically when visiting /signout", async () => {
    localStorage.setItem("token", "saved");
    renderAt("/signout");

    expect(screen.getByText("Sorry to see you go")).toBeInTheDocument();
    expect(await screen.findByRole("link", { name: "Sign In" })).toBeInTheDocument();
    expect(localStorage.getItem("token")).toBeNull();
});
