import { createStore } from "zustand/vanilla";
import type { ContentItem, ScreenpipeQueryParams } from "../types.ts";
import { ScreenpipeUIClient } from "../client.ts";
import { todayRange } from "../formatters/time.ts";

export interface TimelineState {
  items: ContentItem[];
  startTime: string;
  endTime: string;
  appFilter: string | undefined;
  loading: boolean;
  error: string | null;

  setTimeRange: (start: string, end: string) => void;
  setAppFilter: (app: string | undefined) => void;
  loadTimeline: (client: ScreenpipeUIClient) => Promise<void>;
  reset: () => void;
}

export function createTimelineStore() {
  const { start, end } = todayRange();

  return createStore<TimelineState>((set, get) => ({
    items: [],
    startTime: start,
    endTime: end,
    appFilter: undefined,
    loading: false,
    error: null,

    setTimeRange: (start: string, end: string) => set({ startTime: start, endTime: end }),
    setAppFilter: (app) => set({ appFilter: app }),

    loadTimeline: async (client: ScreenpipeUIClient) => {
      const { startTime, endTime, appFilter } = get();
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          startTime,
          endTime,
          appName: appFilter,
          limit: 100,
          contentType: "all",
        });
        set({ items: res.data, loading: false });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },

    reset: () => {
      const { start, end } = todayRange();
      set({
        items: [],
        startTime: start,
        endTime: end,
        appFilter: undefined,
        loading: false,
        error: null,
      });
    },
  }));
}
