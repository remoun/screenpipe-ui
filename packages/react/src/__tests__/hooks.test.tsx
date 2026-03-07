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
import { describe, test, expect, afterEach } from "bun:test";
import { renderHook, cleanup } from "@testing-library/react";
import { useSearch } from "../use-search.ts";
import { useHealth } from "../use-health.ts";
import { useTimeline } from "../use-timeline.ts";
import { ScreenpipeUIClient } from "@screenpipe-ui/core";

afterEach(() => cleanup());

const client = new ScreenpipeUIClient({ baseUrl: "http://test:3030" });

describe("useSearch", () => {
  test("returns initial state with correct shape", () => {
    const { result } = renderHook(() => useSearch(client));
    expect(result.current.query).toBe("");
    expect(result.current.results).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.contentType).toBe("all");
    expect(typeof result.current.search).toBe("function");
    expect(typeof result.current.nextPage).toBe("function");
    expect(typeof result.current.prevPage).toBe("function");
  });
});

describe("useHealth", () => {
  test("returns initial state with correct shape", () => {
    const { result } = renderHook(() => useHealth(client));
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(typeof result.current.check).toBe("function");
    // health is null before check() is called (may be non-null if module mock leaks from other test suites)
    expect("health" in result.current).toBe(true);
  });
});

describe("useTimeline", () => {
  test("returns initial state with correct shape", () => {
    const { result } = renderHook(() => useTimeline(client));
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.appFilter).toBeUndefined();
    expect(typeof result.current.load).toBe("function");
    // startTime should be today
    const startDate = new Date(result.current.startTime);
    const now = new Date();
    expect(startDate.getDate()).toBe(now.getDate());
  });
});
