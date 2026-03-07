import { useSyncExternalStore, useCallback, useRef } from "react";
import { createTimelineStore } from "@screenpipe-ui/core";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";

type StoreApi = ReturnType<typeof createTimelineStore>;

export function useTimeline(client: ScreenpipeUIClient) {
  const storeRef = useRef<StoreApi>();
  if (!storeRef.current) {
    storeRef.current = createTimelineStore();
  }
  const store = storeRef.current;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  const load = useCallback(
    () => store.getState().loadTimeline(client),
    [client, store],
  );

  return { ...state, load };
}
