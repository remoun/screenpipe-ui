import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { dirname } from "node:path";
import type { PreferenceStorage } from "@screenpipe-ui/core";

function getConfigPath(): string {
  const home =
    process.env.XDG_CONFIG_HOME ||
    (process.env.HOME && `${process.env.HOME}/.config`) ||
    process.env.USERPROFILE ||
    ".";
  return `${home}/.config/screenpipe-ui/preferences.json`;
}

function loadConfig(): Record<string, string> {
  const path = getConfigPath();
  try {
    if (existsSync(path)) {
      const raw = readFileSync(path, "utf-8");
      const data = JSON.parse(raw);
      return typeof data === "object" && data !== null ? data : {};
    }
  } catch {
    // ignore
  }
  return {};
}

function saveConfig(data: Record<string, string>): void {
  const path = getConfigPath();
  try {
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, JSON.stringify(data, null, 2), "utf-8");
  } catch {
    // ignore write errors
  }
}

export function createFileConfigAdapter(): PreferenceStorage {
  return {
    get(key: string): string | null {
      const data = loadConfig();
      const value = data[key];
      return typeof value === "string" ? value : null;
    },
    set(key: string, value: string): void {
      const data = loadConfig();
      data[key] = value;
      saveConfig(data);
    },
  };
}
