import { createStore } from "zustand/vanilla";
import type { ContentItem } from "../types.ts";
import type { DateRangePreset } from "../formatters/time.ts";
import { ScreenpipeUIClient } from "../client.ts";
import { todayRange, DATE_RANGE_PRESETS } from "../formatters/time.ts";

export interface TimelineState {
  items: ContentItem[];
  startTime: string | undefined;
  endTime: string | undefined;
  dateRangePreset: DateRangePreset;
  appFilter: string | undefined;
  loading: boolean;
  error: string | null;

  setDateRangePreset: (preset: DateRangePreset) => void;
  setAppFilter: (app: string | undefined) => void;
  loadTimeline: (
    client: ScreenpipeUIClient,
    options?: { limit?: number }
  ) => Promise<void>;
  reset: () => void;
}

function applyPreset(preset: DateRangePreset): {
  startTime: string | undefined;
  endTime: string | undefined;
} {
  if (preset === "all") return { startTime: undefined, endTime: undefined };
  const fn = DATE_RANGE_PRESETS.find((p) => p.value === preset)?.getRange;
  if (!fn) return { startTime: undefined, endTime: undefined };
  const { start, end } = fn();
  return { startTime: start, endTime: end };
}

export interface TimelineStoreOptions {
  initialDateRangePreset?: DateRangePreset;
}

export function createTimelineStore(options?: TimelineStoreOptions) {
  const preset = options?.initialDateRangePreset ?? "today";
  const { startTime, endTime } = applyPreset(preset);

  return createStore<TimelineState>((set, get) => ({
    items: [],
    startTime,
    endTime,
    dateRangePreset: preset,
    appFilter: undefined,
    loading: false,
    error: null,

    setDateRangePreset: (preset) => {
      const { startTime, endTime } = applyPreset(preset);
      set({ dateRangePreset: preset, startTime, endTime });
    },
    setAppFilter: (app) => set({ appFilter: app }),

    loadTimeline: async (client: ScreenpipeUIClient, options?: { limit?: number }) => {
      const { startTime, endTime, appFilter } = get();
      const limit = options?.limit ?? 100;
      set({ loading: true, error: null });
      try {
        const params: Parameters<ScreenpipeUIClient["search"]>[0] = {
          appName: appFilter,
          limit,
          contentType: "all",
        };
        if (startTime) params.startTime = startTime;
        if (endTime) params.endTime = endTime;
        const res = await client.search(params);
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
        dateRangePreset: "today",
        appFilter: undefined,
        loading: false,
        error: null,
      });
    },
  }));
}
