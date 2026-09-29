import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import CommentBox from "components/CommentBox";
import Root from "Root";

let user;

beforeEach(() => {
    user = userEvent.setup();
    render(
        <Root initialState={{ auth: true }}>
            <MemoryRouter>
                <CommentBox />
            </MemoryRouter>
        </Root>
    );
});

it("has a text area and two buttons", () => {
    expect(screen.getByRole("textbox")).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
});

describe("the text area", () => {
    beforeEach(async () => {
        await user.type(screen.getByRole("textbox"), "new comment");
    });

    it("has a text area that users can type in", () => {
        expect(screen.getByRole("textbox")).toHaveValue("new comment");
    });

    it("when form is submitted, text area gets emptied", async () => {
        await user.click(screen.getByRole("button", { name: /submit comment/i }));
        expect(screen.getByRole("textbox")).toHaveValue("");
    });
});