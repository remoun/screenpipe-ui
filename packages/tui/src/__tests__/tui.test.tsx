import React from "react";
import { describe, it, expect, vi, beforeEach } from "bun:test";
import { render } from "ink-testing-library";
import { App } from "../app.tsx";

// Mock the hooks so we don't need a real screenpipe server
const searchFn = vi.fn();
const mockUseSearch = vi.fn();
const mockUseTimeline = vi.fn();
vi.mock("@screenpipe-ui/react", () => ({
  useSearch: (...args: unknown[]) => mockUseSearch(...args),
  useTimeline: (...args: unknown[]) => mockUseTimeline(...args),
  useHealth: () => ({
    health: { status: "ok", frame_status: "ok", audio_status: "ok" },
    loading: false,
    error: null,
    check: vi.fn(),
  }),
}));

const defaultUseSearch = () => ({
  query: "",
  results: [] as { type: string; content: Record<string, unknown> }[],
  pagination: { limit: 20, offset: 0, total: 0 },
  loading: false,
  error: null,
  search: searchFn,
  nextPage: vi.fn(),
  prevPage: vi.fn(),
  setQuery: vi.fn(),
  setContentType: vi.fn(),
  contentType: "all" as const,
});

const defaultUseTimeline = () => ({
  items: [] as { type: string; content: Record<string, unknown> }[],
  startTime: new Date().toISOString(),
  endTime: new Date().toISOString(),
  dateRangePreset: "today" as const,
  appFilter: undefined,
  loading: false,
  error: null,
  load: vi.fn(),
  setDateRangePreset: vi.fn(),
  setAppFilter: vi.fn(),
});

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
  beforeEach(() => {
    mockUseSearch.mockImplementation(defaultUseSearch);
    mockUseTimeline.mockImplementation(defaultUseTimeline);
    searchFn.mockClear();
  });

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
    // Search view shows the search prompt (unfocused: "press / to search")
    expect(frame).toContain("press / to search");
  });

  it("switches tabs on Tab key", () => {
    const { lastFrame, stdin } = render(<App />);

    // Initially on Search (unfocused, shows "press / to search")
    let frame = lastFrame();
    expect(frame).toContain("press / to search");

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
    expect(frame).toContain("screenpipe");
    expect(frame).toContain("tui");
  });

  it("pressing t triggers search to re-run with new type", async () => {
    mockUseSearch.mockImplementation(defaultUseSearch);
    const { stdin } = render(<App />);
    searchFn.mockClear(); // clear initial mount search
    stdin.write("x");
    await new Promise((r) => setImmediate(r));
    stdin.write("\r");
    await new Promise((r) => setImmediate(r));
    stdin.write("t");
    await new Promise((r) => setImmediate(r));
    expect(searchFn).toHaveBeenCalled();
  });

  it("Enter opens detail view when result selected", async () => {
    mockUseSearch.mockImplementation(() => ({
      ...defaultUseSearch(),
      results: [
        { type: "OCR", content: { text: "full transcript", timestamp: "", appName: "Test" } },
      ],
      pagination: { limit: 20, offset: 0, total: 1 },
    }));
    const { lastFrame, stdin } = render(<App />);
    // Search starts unfocused; wait for initial render, then Enter opens detail
    await new Promise((r) => setImmediate(r));
    stdin.write("\r");
    await new Promise((r) => setImmediate(r));
    const frame = lastFrame();
    expect(frame).toContain("Enter/Esc: close");
  });

  it("arrow keys work as j/k and n/p aliases", async () => {
    mockUseSearch.mockImplementation(() => ({
      ...defaultUseSearch(),
      results: [
        { type: "OCR", content: { text: "first", timestamp: "", appName: "App1" } },
        { type: "OCR", content: { text: "second", timestamp: "", appName: "App2" } },
      ],
      pagination: { limit: 20, offset: 0, total: 2 },
    }));
    const { lastFrame, stdin } = render(<App />);
    await new Promise((r) => setImmediate(r));
    stdin.write("\r"); // open detail (item 1)
    await new Promise((r) => setImmediate(r));
    expect(lastFrame()).toContain("(1/2)");
    stdin.write("\x1b[C"); // right arrow = next item (same as n)
    await new Promise((r) => setImmediate(r));
    expect(lastFrame()).toContain("(2/2)");
    stdin.write("\x1b[D"); // left arrow = prev item (same as p)
    await new Promise((r) => setImmediate(r));
    expect(lastFrame()).toContain("(1/2)");
  });

  it("n/p move between items in Search detail view", async () => {
    mockUseSearch.mockImplementation(() => ({
      ...defaultUseSearch(),
      results: [
        { type: "OCR", content: { text: "first", timestamp: "", appName: "App1" } },
        { type: "OCR", content: { text: "second", timestamp: "", appName: "App2" } },
      ],
      pagination: { limit: 20, offset: 0, total: 2 },
    }));
    const { lastFrame, stdin } = render(<App />);
    await new Promise((r) => setImmediate(r));
    stdin.write("\r"); // open detail (item 1)
    await new Promise((r) => setImmediate(r));
    let frame = lastFrame();
    expect(frame).toContain("(1/2)");
    stdin.write("n"); // next item
    await new Promise((r) => setImmediate(r));
    frame = lastFrame();
    expect(frame).toContain("(2/2)");
    stdin.write("p"); // prev item
    await new Promise((r) => setImmediate(r));
    frame = lastFrame();
    expect(frame).toContain("(1/2)");
  });

  it("Enter opens detail view on Timeline tab", async () => {
    mockUseTimeline.mockImplementation(() => ({
      ...defaultUseTimeline(),
      items: [
        { type: "OCR", content: { text: "timeline item", timestamp: new Date().toISOString(), appName: "Test" } },
      ],
      loading: false,
    }));
    const { lastFrame, stdin } = render(<App />);
    await new Promise((r) => setImmediate(r));
    stdin.write("\t"); // switch to Timeline
    await new Promise((r) => setImmediate(r));
    stdin.write("j"); // move past header to first item
    await new Promise((r) => setImmediate(r));
    stdin.write("\r"); // open detail on first item
    await new Promise((r) => setImmediate(r));
    const frame = lastFrame();
    expect(frame).toContain("Enter/Esc: close");
  });

  it("n/p move between items in Timeline detail view", async () => {
    mockUseTimeline.mockImplementation(() => ({
      ...defaultUseTimeline(),
      items: [
        { type: "OCR", content: { text: "first", timestamp: new Date().toISOString(), appName: "A" } },
        { type: "OCR", content: { text: "second", timestamp: new Date().toISOString(), appName: "B" } },
      ],
      loading: false,
    }));
    const { lastFrame, stdin } = render(<App />);
    await new Promise((r) => setImmediate(r));
    stdin.write("\t"); // Timeline
    await new Promise((r) => setImmediate(r));
    stdin.write("j"); // move past header to first item
    await new Promise((r) => setImmediate(r));
    stdin.write("\r"); // open detail
    await new Promise((r) => setImmediate(r));
    let frame = lastFrame();
    expect(frame).toContain("(1/2)");
    stdin.write("n"); // next
    await new Promise((r) => setImmediate(r));
    frame = lastFrame();
    expect(frame).toContain("(2/2)");
  });
});
