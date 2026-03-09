import { GlobalWindow } from "happy-dom";
if (!globalThis.document) {
  const window = new GlobalWindow();
  Object.assign(globalThis, {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
  });
}
import { describe, test, expect, afterEach, vi } from "bun:test";
import { render, within, cleanup, fireEvent } from "@testing-library/react";
import { ExpandableContentCard } from "../ExpandableContentCard";

vi.mock("@screenpipe-ui/core", () => ({
  getContentText: () => "full transcript content here",
}));

const mockItem = {
  type: "OCR" as const,
  content: {
    text: "full transcript content here",
    timestamp: new Date().toISOString(),
    appName: "TestApp",
  },
};

afterEach(() => cleanup());

describe("ExpandableContentCard", () => {
  test("renders summary when collapsed", () => {
    const { container } = render(
      <ExpandableContentCard
        item={mockItem}
        summary={<span>Summary preview</span>}
      />
    );
    expect(within(container).getByText("Summary preview")).toBeDefined();
  });

  test("shows full content when expanded", () => {
    const { container } = render(
      <ExpandableContentCard
        item={mockItem}
        summary={<span>Summary preview</span>}
      />
    );
    const button = within(container).getByRole("button");
    fireEvent.click(button);
    expect(within(container).getByText("full transcript content here")).toBeDefined();
  });

  test("collapses when clicked again", () => {
    const { container } = render(
      <ExpandableContentCard
        item={mockItem}
        summary={<span>Summary preview</span>}
      />
    );
    const button = within(container).getByRole("button");
    fireEvent.click(button);
    expect(within(container).getByText("full transcript content here")).toBeDefined();
    fireEvent.click(button);
    expect(within(container).queryByText("full transcript content here")).toBeNull();
  });
});
