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
    (query?: string) => {
      if (query !== undefined) store.getState().setQuery(query);
      return store.getState().executeSearch(client);
    },
    [client, store],
  );

  const nextPage = useCallback(
    () => store.getState().nextPage(client),
    [client, store],
  );

  const prevPage = useCallback(
    () => store.getState().prevPage(client),
    [client, store],
  );

  return {
    ...state,
    search,
    nextPage,
    prevPage,
  };
}
