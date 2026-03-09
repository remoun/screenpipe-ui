import { createContext, useContext } from "react";
import type { PreferenceStorage } from "@screenpipe-ui/core";

const PreferenceStorageContext = createContext<PreferenceStorage | null>(null);

export const PreferenceStorageProvider = PreferenceStorageContext.Provider;

export function usePreferenceStorage(): PreferenceStorage | null {
  return useContext(PreferenceStorageContext);
}
