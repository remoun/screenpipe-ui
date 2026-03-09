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
  executeSearch: (
    client: ScreenpipeUIClient,
    options?: { query?: string; limit?: number }
  ) => Promise<void>;
  nextPage: (client: ScreenpipeUIClient, options?: { limit?: number }) => Promise<void>;
  prevPage: (client: ScreenpipeUIClient, options?: { limit?: number }) => Promise<void>;
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

    executeSearch: async (client: ScreenpipeUIClient, options?: { query?: string; limit?: number }) => {
      const { query, contentType } = get();
      const q = options?.query !== undefined ? options.query : query;
      const limit = options?.limit ?? DEFAULT_LIMIT;
      if (options?.query !== undefined) set({ query: options.query });
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          q: q || undefined,
          contentType,
          limit,
          offset: 0,
        });
        set({
          results: res.data,
          pagination: { ...res.pagination, limit },
          loading: false,
        });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },

    nextPage: async (client: ScreenpipeUIClient, options?: { limit?: number }) => {
      const { query, contentType, pagination } = get();
      const limit = options?.limit ?? pagination.limit;
      const newOffset = pagination.offset + pagination.limit;
      if (newOffset >= pagination.total) return;
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          q: query || undefined,
          contentType,
          limit,
          offset: newOffset,
        });
        set({
          results: res.data,
          pagination: { ...res.pagination, limit },
          loading: false,
        });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },

    prevPage: async (client: ScreenpipeUIClient, options?: { limit?: number }) => {
      const { query, contentType, pagination } = get();
      const limit = options?.limit ?? pagination.limit;
      const newOffset = Math.max(0, pagination.offset - limit);
      if (newOffset === pagination.offset) return;
      set({ loading: true, error: null });
      try {
        const res = await client.search({
          q: query || undefined,
          contentType,
          limit,
          offset: newOffset,
        });
        set({
          results: res.data,
          pagination: { ...res.pagination, limit },
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
