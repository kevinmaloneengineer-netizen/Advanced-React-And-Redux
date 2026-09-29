import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
import { MemoryRouter } from "react-router-dom";
import Root from "Root";
import App from "components/App";

jest.mock("axios");

beforeEach(() => {
    axios.get.mockResolvedValue({
        status: 200,
        data: [{ name: "Fetched #1" }, { name: "Fetched #2" }],
    });
});

afterEach(() => {
    jest.resetAllMocks();
});

it("can fetch a list of comments and display them", async () => {
    const user = userEvent.setup();

    render(
        <Root initialState={{ auth: true }}>
            <MemoryRouter initialEntries={["/post"]}>
                <App />
            </MemoryRouter>
        </Root>
    );

    await user.click(screen.getByRole("button", { name: /fetch comments/i }));

    // Comments show on the home page
    await user.click(screen.getByRole("link", { name: "Home" }));

    expect(await screen.findByText("Fetched #1")).toBeInTheDocument();
    expect(screen.getByText("Fetched #2")).toBeInTheDocument();
    expect(axios.get).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/comments"
    );
});
