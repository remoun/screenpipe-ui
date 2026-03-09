import { describe, test, expect } from "bun:test";
import {
  PREFERENCE_KEYS,
  getPersistedPreference,
  type PreferenceStorage,
} from "../preference-storage.ts";

function createMockStorage(initial: Record<string, string> = {}): PreferenceStorage {
  const store = new Map<string, string>(Object.entries(initial));
  return {
    get: (key: string) => store.get(key) ?? null,
    set: (key: string, value: string) => store.set(key, value),
  };
}

describe("preference storage", () => {
  test("PREFERENCE_KEYS has dateRangePreset", () => {
    expect(PREFERENCE_KEYS.dateRangePreset).toBe("dateRangePreset");
  });

  test("getPersistedPreference returns default when storage is null", () => {
    expect(getPersistedPreference(null, "key", "default")).toBe("default");
  });

  test("getPersistedPreference returns default when key is missing", () => {
    const storage = createMockStorage();
    expect(getPersistedPreference(storage, "missing", "default")).toBe("default");
  });

  test("getPersistedPreference returns stored value when present", () => {
    const storage = createMockStorage({ dateRangePreset: "yesterday" });
    expect(
      getPersistedPreference(storage, PREFERENCE_KEYS.dateRangePreset, "today")
    ).toBe("yesterday");
  });

  test("getPersistedPreference returns default when validate rejects", () => {
    const storage = createMockStorage({ dateRangePreset: "invalid" });
    const isValid = (v: string) => ["today", "yesterday", "last7", "all"].includes(v);
    expect(
      getPersistedPreference(storage, PREFERENCE_KEYS.dateRangePreset, "today", isValid)
    ).toBe("today");
  });

  test("getPersistedPreference returns stored value when validate accepts", () => {
    const storage = createMockStorage({ dateRangePreset: "last7" });
    const isValid = (v: string) => ["today", "yesterday", "last7", "all"].includes(v);
    expect(
      getPersistedPreference(storage, PREFERENCE_KEYS.dateRangePreset, "today", isValid)
    ).toBe("last7");
  });

  test("getPersistedPreference returns default when storage throws", () => {
    const storage: PreferenceStorage = {
      get: () => {
        throw new Error("storage error");
      },
      set: () => {},
    };
    expect(getPersistedPreference(storage, "key", "default")).toBe("default");
  });
});
