import { describe, test, expect, mock, beforeEach } from "bun:test";
import { createSearchStore } from "../stores/search-store.ts";
import { createHealthStore } from "../stores/health-store.ts";
import { createTimelineStore } from "../stores/timeline-store.ts";
import { ScreenpipeUIClient } from "../client.ts";

function mockClient(response: unknown): ScreenpipeUIClient {
  const client = new ScreenpipeUIClient({ baseUrl: "http://test:3030" });
  // @ts-ignore - mock the private get method
  client.search = mock(() => Promise.resolve(response));
  // @ts-ignore
  client.health = mock(() => Promise.resolve(response));
  return client;
}

const mockSearchResponse = {
  data: [
    {
      type: "OCR" as const,
      content: {
        frameId: 1,
        text: "hello world",
        timestamp: "2024-01-15T10:00:00Z",
        filePath: "/tmp/test.mp4",
        offsetIndex: 0,
        appName: "Chrome",
        windowName: "Google",
        tags: [],
      },
    },
  ],
  pagination: { limit: 20, offset: 0, total: 1 },
};

describe("search store", () => {
  test("initial state", () => {
    const store = createSearchStore();
    const state = store.getState();
    expect(state.query).toBe("");
    expect(state.contentType).toBe("all");
    expect(state.results).toEqual([]);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test("setQuery updates query", () => {
    const store = createSearchStore();
    store.getState().setQuery("test search");
    expect(store.getState().query).toBe("test search");
  });

  test("setContentType updates contentType", () => {
    const store = createSearchStore();
    store.getState().setContentType("ocr");
    expect(store.getState().contentType).toBe("ocr");
  });

  test("executeSearch fetches results", async () => {
    const store = createSearchStore();
    const client = mockClient(mockSearchResponse);

    store.getState().setQuery("hello");
    await store.getState().executeSearch(client);

    const state = store.getState();
    expect(state.results).toHaveLength(1);
    expect(state.results[0].type).toBe("OCR");
    expect(state.pagination.total).toBe(1);
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test("executeSearch sets loading during fetch", async () => {
    const store = createSearchStore();
    let wasLoading = false;

    const client = mockClient(mockSearchResponse);
    // @ts-ignore
    client.search = mock(() => {
      wasLoading = store.getState().loading;
      return Promise.resolve(mockSearchResponse);
    });

    await store.getState().executeSearch(client);
    expect(wasLoading).toBe(true);
  });

  test("executeSearch handles errors", async () => {
    const store = createSearchStore();
    const client = new ScreenpipeUIClient({ baseUrl: "http://test:3030" });
    // @ts-ignore
    client.search = mock(() => Promise.reject(new Error("connection refused")));

    await store.getState().executeSearch(client);

    const state = store.getState();
    expect(state.error).toBe("connection refused");
    expect(state.loading).toBe(false);
  });

  test("nextPage does nothing when at end", async () => {
    const store = createSearchStore();
    const client = mockClient(mockSearchResponse);

    // Load first page (total=1, limit=20, so already at end)
    await store.getState().executeSearch(client);
    const callsBefore = (client.search as ReturnType<typeof mock>).mock.calls.length;

    await store.getState().nextPage(client);
    const callsAfter = (client.search as ReturnType<typeof mock>).mock.calls.length;
    expect(callsAfter).toBe(callsBefore);
  });

  test("reset clears state", async () => {
    const store = createSearchStore();
    const client = mockClient(mockSearchResponse);

    store.getState().setQuery("test");
    await store.getState().executeSearch(client);
    store.getState().reset();

    const state = store.getState();
    expect(state.query).toBe("");
    expect(state.results).toEqual([]);
  });
});

describe("health store", () => {
  test("initial state", () => {
    const store = createHealthStore();
    const state = store.getState();
    expect(state.health).toBeNull();
    expect(state.loading).toBe(false);
    expect(state.error).toBeNull();
  });

  test("checkHealth fetches health", async () => {
    const mockHealth = {
      status: "healthy",
      status_code: 200,
      frame_status: "ok",
      audio_status: "ok",
      message: "all good",
    };
    const store = createHealthStore();
    const client = mockClient(mockHealth);

    await store.getState().checkHealth(client);

    const state = store.getState();
    expect(state.health?.status).toBe("healthy");
    expect(state.loading).toBe(false);
  });

  test("checkHealth handles errors", async () => {
    const store = createHealthStore();
    const client = new ScreenpipeUIClient({ baseUrl: "http://test:3030" });
    // @ts-ignore
    client.health = mock(() => Promise.reject(new Error("offline")));

    await store.getState().checkHealth(client);

    expect(store.getState().error).toBe("offline");
    expect(store.getState().loading).toBe(false);
  });
});

describe("timeline store", () => {
  test("initial state has today's range", () => {
    const store = createTimelineStore();
    const state = store.getState();
    const startDate = new Date(state.startTime);
    expect(startDate.getHours()).toBe(0);
    expect(state.items).toEqual([]);
  });

  test("setTimeRange updates range", () => {
    const store = createTimelineStore();
    store.getState().setTimeRange("2024-01-01T00:00:00Z", "2024-01-02T00:00:00Z");
    expect(store.getState().startTime).toBe("2024-01-01T00:00:00Z");
    expect(store.getState().endTime).toBe("2024-01-02T00:00:00Z");
  });

  test("setAppFilter updates filter", () => {
    const store = createTimelineStore();
    store.getState().setAppFilter("Chrome");
    expect(store.getState().appFilter).toBe("Chrome");
  });

  test("loadTimeline fetches items", async () => {
    const store = createTimelineStore();
    const client = mockClient(mockSearchResponse);

    await store.getState().loadTimeline(client);

    expect(store.getState().items).toHaveLength(1);
    expect(store.getState().loading).toBe(false);
  });

  test("reset restores defaults", () => {
    const store = createTimelineStore();
    store.getState().setAppFilter("Chrome");
    store.getState().reset();
    expect(store.getState().appFilter).toBeUndefined();
  });
});
