import { describe, test, expect } from "bun:test";
import {
  timeAgo,
  formatDuration,
  formatTime,
  formatDate,
  todayRange,
} from "../formatters/time.ts";
import {
  truncate,
  contentTypeLabel,
  highlightMatch,
  stripAnsi,
  contentPreview,
} from "../formatters/content.ts";
import { formatTable } from "../formatters/table.ts";
import type { ContentItem } from "../types.ts";

describe("time formatters", () => {
  test("timeAgo returns 'just now' for recent timestamps", () => {
    const now = new Date().toISOString();
    expect(timeAgo(now)).toBe("just now");
  });

  test("timeAgo returns minutes ago", () => {
    const fiveMinAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString();
    expect(timeAgo(fiveMinAgo)).toBe("5m ago");
  });

  test("timeAgo returns hours ago", () => {
    const twoHoursAgo = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(twoHoursAgo)).toBe("2h ago");
  });

  test("timeAgo returns days ago", () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
    expect(timeAgo(threeDaysAgo)).toBe("3d ago");
  });

  test("formatDuration formats seconds", () => {
    expect(formatDuration(5000)).toBe("5s");
  });

  test("formatDuration formats minutes", () => {
    expect(formatDuration(5 * 60 * 1000)).toBe("5m");
  });

  test("formatDuration formats hours and minutes", () => {
    expect(formatDuration(2 * 60 * 60 * 1000 + 30 * 60 * 1000)).toBe("2h 30m");
  });

  test("formatDuration formats exact hours", () => {
    expect(formatDuration(3 * 60 * 60 * 1000)).toBe("3h");
  });

  test("formatTime returns HH:MM format", () => {
    const result = formatTime("2024-01-15T14:30:00Z");
    expect(result).toMatch(/\d{1,2}:\d{2}/);
  });

  test("formatDate returns readable date", () => {
    const result = formatDate("2024-01-15T14:30:00Z");
    expect(result).toContain("Jan");
    expect(result).toContain("15");
  });

  test("todayRange returns start before end", () => {
    const { start, end } = todayRange();
    expect(new Date(start).getTime()).toBeLessThan(new Date(end).getTime());
  });

  test("todayRange start is midnight today", () => {
    const { start } = todayRange();
    const d = new Date(start);
    expect(d.getHours()).toBe(0);
    expect(d.getMinutes()).toBe(0);
  });
});

describe("content formatters", () => {
  test("truncate short text unchanged", () => {
    expect(truncate("hello", 80)).toBe("hello");
  });

  test("truncate long text with ellipsis", () => {
    const long = "a".repeat(100);
    const result = truncate(long, 80);
    expect(result.length).toBe(80);
    expect(result.endsWith("\u2026")).toBe(true);
  });

  test("contentTypeLabel for OCR", () => {
    const item: ContentItem = {
      type: "OCR",
      content: { frameId: 1, text: "test", timestamp: "", filePath: "", offsetIndex: 0, appName: "Chrome", windowName: "", tags: [] },
    };
    expect(contentTypeLabel(item)).toBe("screen");
  });

  test("contentTypeLabel for Audio", () => {
    const item: ContentItem = {
      type: "Audio",
      content: { chunkId: 1, transcription: "hello", timestamp: "", filePath: "", offsetIndex: 0, tags: [], deviceName: "mic", deviceType: "Input" },
    };
    expect(contentTypeLabel(item)).toBe("audio");
  });

  test("highlightMatch wraps matches with ANSI bold yellow", () => {
    const result = highlightMatch("hello world", "world");
    expect(result).toContain("\x1b[1;33mworld\x1b[0m");
  });

  test("highlightMatch is case insensitive", () => {
    const result = highlightMatch("Hello World", "hello");
    expect(result).toContain("\x1b[1;33mHello\x1b[0m");
  });

  test("highlightMatch with empty query returns original", () => {
    expect(highlightMatch("test", "")).toBe("test");
  });

  test("stripAnsi removes ANSI codes", () => {
    expect(stripAnsi("\x1b[1;33mtest\x1b[0m")).toBe("test");
  });

  test("contentPreview for OCR strips newlines", () => {
    const item: ContentItem = {
      type: "OCR",
      content: { frameId: 1, text: "line1\nline2\nline3", timestamp: "", filePath: "", offsetIndex: 0, appName: "", windowName: "", tags: [] },
    };
    expect(contentPreview(item)).toBe("line1 line2 line3");
  });

  test("contentPreview for Audio", () => {
    const item: ContentItem = {
      type: "Audio",
      content: { chunkId: 1, transcription: "hello from meeting", timestamp: "", filePath: "", offsetIndex: 0, tags: [], deviceName: "mic", deviceType: "Input" },
    };
    expect(contentPreview(item)).toBe("hello from meeting");
  });
});

describe("table formatter", () => {
  test("formatTable renders header and rows", () => {
    const result = formatTable(
      [
        { header: "Name", width: 10 },
        { header: "Age", width: 5, align: "right" },
      ],
      [
        ["Alice", "30"],
        ["Bob", "25"],
      ]
    );
    const lines = result.split("\n");
    expect(lines.length).toBe(4); // header + divider + 2 rows
    expect(lines[0]).toContain("Name");
    expect(lines[0]).toContain("Age");
    expect(lines[2]).toContain("Alice");
    expect(lines[3]).toContain("Bob");
  });

  test("formatTable right-aligns numbers", () => {
    const result = formatTable(
      [{ header: "Val", width: 5, align: "right" }],
      [["42"]]
    );
    const dataLine = result.split("\n")[2];
    expect(dataLine).toMatch(/^\s+42$/);
  });
});
