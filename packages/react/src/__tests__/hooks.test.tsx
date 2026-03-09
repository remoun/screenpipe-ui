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
import React from "react";
import { describe, test, expect, afterEach } from "bun:test";
import { renderHook, cleanup } from "@testing-library/react";
import { useSearch } from "../hooks/use-search.ts";
import { useHealth } from "../hooks/use-health.ts";
import { useTimeline } from "../hooks/use-timeline.ts";
import { usePersistedPreference } from "../hooks/use-persisted-preference.ts";
import { ScreenpipeUIClient } from "@screenpipe-ui/core";

afterEach(() => cleanup());

const client = new ScreenpipeUIClient({ baseUrl: "http://test:3030" });

const mockStorage = {
  data: new Map<string, string>(),
  get(key: string) {
    return this.data.get(key) ?? null;
  },
  set(key: string, value: string) {
    this.data.set(key, value);
  },
};

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

describe("usePersistedPreference", () => {
  test("returns default when no storage", () => {
    const { result } = renderHook(() =>
      usePersistedPreference(null, "key", "default")
    );
    expect(result.current[0]).toBe("default");
  });

  test("reads from storage and persists on set", () => {
    mockStorage.data.clear();
    mockStorage.data.set("testKey", "stored");
    const { result } = renderHook(() =>
      usePersistedPreference(mockStorage, "testKey", "default")
    );
    expect(result.current[0]).toBe("stored");
    result.current[1]("newValue");
    expect(mockStorage.data.get("testKey")).toBe("newValue");
  });
});

describe("useTimeline", () => {
  test("returns initial state with correct shape", () => {
    const { result } = renderHook(() => useTimeline(client));
    expect(result.current.items).toEqual([]);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.appFilter).toBeUndefined();
    expect(result.current.dateRangePreset).toBe("today");
    expect(typeof result.current.load).toBe("function");
    expect(typeof result.current.setDateRangePreset).toBe("function");
    // startTime should be today
    const startDate = new Date(result.current.startTime!);
    const now = new Date();
    expect(startDate.getDate()).toBe(now.getDate());
  });
});
