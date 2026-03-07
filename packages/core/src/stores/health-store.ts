import { createStore } from "zustand/vanilla";
import type { HealthCheckResponse } from "../client.ts";
import { ScreenpipeUIClient } from "../client.ts";

export interface HealthState {
  health: HealthCheckResponse | null;
  loading: boolean;
  error: string | null;

  checkHealth: (client: ScreenpipeUIClient) => Promise<void>;
}

export function createHealthStore() {
  return createStore<HealthState>((set) => ({
    health: null,
    loading: false,
    error: null,

    checkHealth: async (client: ScreenpipeUIClient) => {
      set({ loading: true, error: null });
      try {
        const health = await client.health();
        set({ health, loading: false });
      } catch (e) {
        set({
          error: e instanceof Error ? e.message : String(e),
          loading: false,
        });
      }
    },
  }));
}
