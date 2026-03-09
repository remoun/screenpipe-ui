/**
 * Interface for persisting user preferences.
 * Implementations: localStorage (web), file (TUI/CLI).
 */
export interface PreferenceStorage {
  get(key: string): string | null;
  set(key: string, value: string): void;
}

const DEFAULT_KEYS = {
  dateRangePreset: "dateRangePreset",
} as const;

export const PREFERENCE_KEYS = DEFAULT_KEYS;

/**
 * Read a persisted preference, with optional validation.
 */
export function getPersistedPreference(
  storage: PreferenceStorage | null,
  key: string,
  defaultValue: string,
  validate?: (value: string) => boolean
): string {
  if (!storage) return defaultValue;
  try {
    const stored = storage.get(key);
    if (stored == null || stored === "") return defaultValue;
    if (validate && !validate(stored)) return defaultValue;
    return stored;
  } catch {
    return defaultValue;
  }
}
