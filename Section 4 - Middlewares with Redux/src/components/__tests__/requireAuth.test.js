import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { useDispatch } from "react-redux";
import requireAuth from "components/requireAuth";
import { changeAuth } from "actions";
import Root from "Root";

const Secret = ({ message }) => <div>Secret: {message}</div>;
const ProtectedSecret = requireAuth(Secret);

const SignOutButton = () => {
    const dispatch = useDispatch();
    return <button onClick={() => dispatch(changeAuth(false))}>Sign Out</button>;
};

function renderProtected(auth) {
    render(
        <Root initialState={{ auth }}>
            <MemoryRouter initialEntries={["/secret"]}>
                <SignOutButton />
                <Routes>
                    <Route path="/" element={<div>Home page</div>} />
                    <Route path="/secret" element={<ProtectedSecret message="hello" />} />
                </Routes>
            </MemoryRouter>
        </Root>
    );
}

it("renders the wrapped component and passes props through when signed in", () => {
    renderProtected(true);
    expect(screen.getByText("Secret: hello")).toBeInTheDocument();
});

it("redirects to / when not signed in", async () => {
    renderProtected(false);
    expect(await screen.findByText("Home page")).toBeInTheDocument();
});

it("redirects to / when the user signs out on the page", async () => {
    const user = userEvent.setup();
    renderProtected(true);

    await user.click(screen.getByRole("button", { name: "Sign Out" }));

    expect(await screen.findByText("Home page")).toBeInTheDocument();
});
