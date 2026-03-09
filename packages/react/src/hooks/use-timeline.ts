import { useSyncExternalStore, useCallback, useMemo } from "react";
import {
  createTimelineStore,
  getPersistedPreference,
  PREFERENCE_KEYS,
  DATE_RANGE_PRESETS,
  ScreenpipeUIClient,
} from "@screenpipe-ui/core";
import type { DateRangePreset } from "@screenpipe-ui/core";
import { usePreferenceStorage } from "../context/preference-storage-context.tsx";
import { usePersistOnChange } from "./use-persisted-preference.ts";

type StoreApi = ReturnType<typeof createTimelineStore>;

const VALID_PRESETS = new Set<string>(
  DATE_RANGE_PRESETS.map((p) => p.value)
);
function isValidDateRangePreset(v: string): boolean {
  return VALID_PRESETS.has(v);
}

let sharedStore: StoreApi | null = null;

export function useTimeline(client: InstanceType<typeof ScreenpipeUIClient>) {
  const storage = usePreferenceStorage();
  const initialPreset = useMemo(
    () =>
      getPersistedPreference(
        storage,
        PREFERENCE_KEYS.dateRangePreset,
        "today",
        isValidDateRangePreset
      ),
    [storage]
  );

  if (!sharedStore) {
    sharedStore = createTimelineStore({
      initialDateRangePreset: initialPreset as DateRangePreset,
    });
  }
  const store = sharedStore;

  const state = useSyncExternalStore(
    store.subscribe,
    store.getState,
    store.getState
  );

  usePersistOnChange(
    storage,
    PREFERENCE_KEYS.dateRangePreset,
    state.dateRangePreset,
    isValidDateRangePreset
  );

  const load = useCallback(
    () => store.getState().loadTimeline(client),
    [client, store]
  );

  return { ...state, load };
}
