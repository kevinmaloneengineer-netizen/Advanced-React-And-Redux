import { render, screen } from "@testing-library/react";
import CommentList from "components/CommentList";
import Root from "Root";

beforeEach(() => {
    const initialState = {
        comments: ["Comment 1", "Comment 2"],
    };

    render(
        <Root initialState={initialState}>
            <CommentList />
        </Root>
    );
});

it("creates one LI per comment", () => {
    expect(screen.getAllByRole("listitem")).toHaveLength(2);
});

it("shows the text for each comment", () => {
    expect(screen.getByText("Comment 1")).toBeInTheDocument();
    expect(screen.getByText("Comment 2")).toBeInTheDocument();
});
