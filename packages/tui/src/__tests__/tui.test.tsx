import React from "react";
import { describe, it, expect, vi, beforeEach } from "bun:test";
import { render } from "ink-testing-library";
import { App } from "../app.tsx";

// Mock the hooks so we don't need a real screenpipe server
vi.mock("@screenpipe-ui/react", () => ({
  useSearch: () => ({
    query: "",
    results: [],
    pagination: { limit: 20, offset: 0, total: 0 },
    loading: false,
    error: null,
    search: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    setQuery: vi.fn(),
    setContentType: vi.fn(),
    contentType: "all",
  }),
  useTimeline: () => ({
    items: [],
    startTime: new Date().toISOString(),
    endTime: new Date().toISOString(),
    appFilter: undefined,
    loading: false,
    error: null,
    load: vi.fn(),
    setTimeRange: vi.fn(),
    setAppFilter: vi.fn(),
  }),
  useHealth: () => ({
    health: { status: "ok", frame_status: "ok", audio_status: "ok" },
    loading: false,
    error: null,
    check: vi.fn(),
  }),
}));

vi.mock("@screenpipe-ui/core", () => ({
  createClient: () => ({}),
  contentPreview: () => "preview text",
  contentTypeLabel: () => "screen",
  timeAgo: () => "1m ago",
  getContentAppName: () => "TestApp",
  getContentText: () => "test text",
  getContentTimestamp: () => new Date().toISOString(),
  formatTime: () => "12:00",
  truncate: (t: string) => t,
}));

describe("TUI App", () => {
  it("renders without crashing", () => {
    const { lastFrame } = render(<App />);
    const frame = lastFrame();
    expect(frame).toBeDefined();
    expect(frame).toContain("Search");
    expect(frame).toContain("Timeline");
    expect(frame).toContain("Meetings");
  });

  it("shows the search view by default", () => {
    const { lastFrame } = render(<App />);
    const frame = lastFrame();
    // Search view shows the search prompt
    expect(frame).toContain("search screenpipe");
  });

  it("switches tabs on Tab key", () => {
    const { lastFrame, stdin } = render(<App />);

    // Initially on Search
    let frame = lastFrame();
    expect(frame).toContain("search screenpipe");

    // Press Tab to go to Timeline
    stdin.write("\t");
    frame = lastFrame();
    expect(frame).toContain("Timeline");

    // Press Tab to go to Meetings
    stdin.write("\t");
    frame = lastFrame();
    expect(frame).toContain("Meetings");
  });

  it("shows status bar with connection info", () => {
    const { lastFrame } = render(<App />);
    const frame = lastFrame();
    expect(frame).toContain("screenpipe-tui");
  });
});
