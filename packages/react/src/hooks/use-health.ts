import { useSyncExternalStore, useCallback, useRef } from "react";
import { createHealthStore, ScreenpipeUIClient } from "@screenpipe-ui/core";

type StoreApi = ReturnType<typeof createHealthStore>;

export function useHealth(client: InstanceType<typeof ScreenpipeUIClient>) {
  const storeRef = useRef<StoreApi>();
  if (!storeRef.current) {
    storeRef.current = createHealthStore();
  }
  const store = storeRef.current;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState,
  );

  const check = useCallback(
    () => store.getState().checkHealth(client),
    [client, store],
  );

  return { ...state, check };
}
