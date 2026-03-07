import { describe, test, expect } from "bun:test";
import {
  getContentText,
  getContentTimestamp,
  getContentAppName,
} from "../client.ts";
import type { ContentItem } from "@screenpipe/js";

const ocrItem: ContentItem = {
  type: "OCR",
  content: {
    frameId: 1,
    text: "screen text",
    timestamp: "2024-01-15T10:00:00Z",
    filePath: "/tmp/test.mp4",
    offsetIndex: 0,
    appName: "Chrome",
    windowName: "Google",
    tags: [],
  },
};

const audioItem: ContentItem = {
  type: "Audio",
  content: {
    chunkId: 1,
    transcription: "hello world",
    timestamp: "2024-01-15T10:01:00Z",
    filePath: "/tmp/audio.wav",
    offsetIndex: 0,
    tags: [],
    deviceName: "MacBook Pro Microphone",
    deviceType: "Input",
  },
};

const uiItem: ContentItem = {
  type: "UI",
  content: {
    id: 1,
    text: "button label",
    timestamp: "2024-01-15T10:02:00Z",
    appName: "Slack",
    windowName: "General",
    filePath: "",
    offsetIndex: 0,
  },
};

describe("getContentText", () => {
  test("extracts text from OCR", () => {
    expect(getContentText(ocrItem)).toBe("screen text");
  });

  test("extracts transcription from Audio", () => {
    expect(getContentText(audioItem)).toBe("hello world");
  });

  test("extracts text from UI", () => {
    expect(getContentText(uiItem)).toBe("button label");
  });
});

describe("getContentTimestamp", () => {
  test("extracts timestamp from OCR", () => {
    expect(getContentTimestamp(ocrItem)).toBe("2024-01-15T10:00:00Z");
  });

  test("extracts timestamp from Audio", () => {
    expect(getContentTimestamp(audioItem)).toBe("2024-01-15T10:01:00Z");
  });
});

describe("getContentAppName", () => {
  test("extracts appName from OCR", () => {
    expect(getContentAppName(ocrItem)).toBe("Chrome");
  });

  test("extracts deviceName from Audio", () => {
    expect(getContentAppName(audioItem)).toBe("MacBook Pro Microphone");
  });

  test("extracts appName from UI", () => {
    expect(getContentAppName(uiItem)).toBe("Slack");
  });
});
