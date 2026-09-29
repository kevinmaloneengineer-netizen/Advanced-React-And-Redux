import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import axios from "axios";
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
        <Root>
            <App />
        </Root>
    );

    await user.click(screen.getByRole("button", { name: /fetch comments/i }));

    expect(await screen.findAllByRole("listitem")).toHaveLength(2);
    expect(axios.get).toHaveBeenCalledWith(
        "https://jsonplaceholder.typicode.com/comments"
    );
});
