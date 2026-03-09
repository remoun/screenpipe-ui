import { useState, useCallback, useEffect } from "react";
import type { PreferenceStorage } from "@screenpipe-ui/core";
import { getPersistedPreference } from "@screenpipe-ui/core";

/**
 * Self-contained state that persists to storage.
 * Use when the component owns the value.
 */
export function usePersistedPreference(
  storage: PreferenceStorage | null,
  key: string,
  defaultValue: string,
  validate?: (value: string) => boolean
): [string, (value: string) => void] {
  const [value, setValueState] = useState(() =>
    getPersistedPreference(storage, key, defaultValue, validate)
  );

  const setValue = useCallback(
    (v: string) => {
      setValueState(v);
      if (storage && (!validate || validate(v))) {
        try {
          storage.set(key, v);
        } catch {
          // ignore write errors
        }
      }
    },
    [storage, key, validate]
  );

  return [value, setValue];
}

/**
 * Persists an external value to storage when it changes.
 * Use when the value lives in a store (e.g. zustand) and you want to sync to storage.
 */
export function usePersistOnChange(
  storage: PreferenceStorage | null,
  key: string,
  value: string,
  validate?: (value: string) => boolean
): void {
  useEffect(() => {
    if (!storage || (validate && !validate(value))) return;
    try {
      storage.set(key, value);
    } catch {
      // ignore write errors
    }
  }, [storage, key, value, validate]);
}
