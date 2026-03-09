import { useSyncExternalStore, useCallback, useRef } from "react";
import { createSearchStore, ScreenpipeUIClient } from "@screenpipe-ui/core";

type StoreApi = ReturnType<typeof createSearchStore>;

export function useSearch(client: InstanceType<typeof ScreenpipeUIClient>) {
  const storeRef = useRef<StoreApi>();
  if (!storeRef.current) {
    storeRef.current = createSearchStore();
  }
  const store = storeRef.current;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  const search = useCallback(
    (query?: string, options?: { limit?: number }) =>
      store.getState().executeSearch(client, {
        query: query !== undefined ? query : undefined,
        limit: options?.limit,
      }),
    [client, store],
  );

  const nextPage = useCallback(
    (options?: { limit?: number }) => store.getState().nextPage(client, options),
    [client, store],
  );

  const prevPage = useCallback(
    (options?: { limit?: number }) => store.getState().prevPage(client, options),
    [client, store],
  );

  return {
    ...state,
    search,
    nextPage,
    prevPage,
  };
}
