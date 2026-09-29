import { render, screen } from "@testing-library/react";
import App from "components/App";

beforeEach(() => {
    render(<App />);
});

jest.mock("components/CommentBox", () => () => <div data-testid="comment-box" />);

it("shows a comment box", () => {
    expect(screen.getAllByTestId("comment-box")).toHaveLength(1);
});

jest.mock("components/CommentList", () => () => <div data-testid="comment-list" />);

it("shows a comment list", () => {
    expect(screen.getAllByTestId("comment-list")).toHaveLength(1);
});