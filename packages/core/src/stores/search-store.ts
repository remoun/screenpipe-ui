import { createStore } from "zustand/vanilla";
import type { ContentItem, ScreenpipeQueryParams, PaginationInfo } from "../types.ts";
import { ScreenpipeUIClient } from "../client.ts";

export interface SearchState {
  query: string;
  contentType: ScreenpipeQueryParams["contentType"];
  results: ContentItem[];
  pagination: PaginationInfo;
  loading: boolean;
  error: string | null;

  setQuery: (q: string) => void;
  setContentType: (t: ScreenpipeQueryParams["contentType"]) => void;
  executeSearch: (client: ScreenpipeUIClient) => Promise<void>;
  nextPage: (client: ScreenpipeUIClient) => Promise<void>;
  prevPage: (client: ScreenpipeUIClient) => Promise<void>;
  reset: () => void;
}

const DEFAULT_LIMIT = 20;

const initialState = {
  query: "",
  contentType: "all" as const,
  results: [] as ContentItem[],
  pagination: { limit: DEFAULT_LIMIT, offset: 0, total: 0 },
  loading: false,
  error: null as string | null,
};

export function createSearchStore() {
  return createStore<SearchState>((set, get) => ({
    ...initialState,

    setQuery: (q: string) => set({ query: q }),
    setContentType: (t) => set({ contentType: t }),

    executeSearch: async (client: ScreenpipeUIClient) => {
      const { query, contentType } = get();
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          q: query || undefined,
          contentType,
          limit: DEFAULT_LIMIT,
          offset: 0,
        });
        set({
          results: res.data,
          pagination: res.pagination,
          loading: false,
        });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },

    nextPage: async (client: ScreenpipeUIClient) => {
      const { query, contentType, pagination } = get();
      const newOffset = pagination.offset + pagination.limit;
      if (newOffset >= pagination.total) return;
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          q: query || undefined,
          contentType,
          limit: pagination.limit,
          offset: newOffset,
        });
        set({
          results: res.data,
          pagination: res.pagination,
          loading: false,
        });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },

    prevPage: async (client: ScreenpipeUIClient) => {
      const { query, contentType, pagination } = get();
      const newOffset = Math.max(0, pagination.offset - pagination.limit);
      if (newOffset === pagination.offset) return;
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          q: query || undefined,
          contentType,
          limit: pagination.limit,
          offset: newOffset,
        });
        set({
          results: res.data,
          pagination: res.pagination,
          loading: false,
        });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },

    reset: () => set(initialState),
  }));
}
