import type { PreferenceStorage } from "@screenpipe-ui/core";

const PREFIX = "screenpipe-ui:";

export function createLocalStorageAdapter(): PreferenceStorage {
  return {
    get(key: string): string | null {
      if (typeof localStorage === "undefined") return null;
      try {
        return localStorage.getItem(PREFIX + key);
      } catch {
        return null;
      }
    },
    set(key: string, value: string): void {
      if (typeof localStorage === "undefined") return;
      try {
        localStorage.setItem(PREFIX + key, value);
      } catch {
        // ignore
      }
    },
  };
}
