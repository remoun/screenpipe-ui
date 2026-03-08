import React from "react";
import { describe, it, expect, vi } from "bun:test";
import { render } from "ink-testing-library";
import { DetailView } from "../detail-view.tsx";

vi.mock("@screenpipe-ui/core", () => ({
  contentTypeLabel: () => "screen",
  timeAgo: () => "1m ago",
  getContentAppName: () => "TestApp",
  getContentTimestamp: () => new Date().toISOString(),
  getContentText: () => "sample transcript content",
}));

const mockItem = {
  type: "OCR" as const,
  content: {
    text: "sample transcript content",
    timestamp: new Date().toISOString(),
    appName: "TestApp",
  },
};

describe("DetailView", () => {
  it("renders item metadata and content", () => {
    const { lastFrame } = render(
      <DetailView
        item={mockItem}
        scrollOffset={0}
        contentWidth={60}
        contentHeight={10}
      />,
    );
    const frame = lastFrame();
    expect(frame).toContain("screen");
    expect(frame).toContain("1m ago");
    expect(frame).toContain("TestApp");
    expect(frame).toContain("sample transcript content");
    expect(frame).toContain("Enter/Esc: close");
  });

  it("shows item position when itemPosition provided", () => {
    const { lastFrame } = render(
      <DetailView
        item={mockItem}
        scrollOffset={0}
        contentWidth={60}
        contentHeight={10}
        itemPosition={{ current: 2, total: 5 }}
      />,
    );
    const frame = lastFrame();
    expect(frame).toContain("n/p: next/prev (2/5)");
  });
});
