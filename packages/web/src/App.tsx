import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { createClient } from "@screenpipe-ui/core";
import { PreferenceStorageProvider } from "@screenpipe-ui/react";
import { getBaseUrl } from "./get-base-url";
import { createLocalStorageAdapter } from "./preference-storage";
import { Layout } from "./components/Layout";
import { SearchPage } from "./pages/SearchPage";
import { TimelinePage } from "./pages/TimelinePage";
import { MeetingsPage } from "./pages/MeetingsPage";

export function App() {
  const preferenceStorage = useMemo(() => createLocalStorageAdapter(), []);

  const client = useMemo(
    () =>
      createClient({
        baseUrl: getBaseUrl(
          typeof window !== "undefined" ? window.location.search : "",
          import.meta.env.SCREENPIPE_BASE_URL
        ),
      }),
    []
  );

  return (
    <PreferenceStorageProvider value={preferenceStorage}>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout client={client} />}>
          <Route path="/search" element={<SearchPage client={client} />} />
          <Route path="/timeline" element={<TimelinePage client={client} />} />
          <Route path="/meetings" element={<MeetingsPage client={client} />} />
          <Route path="*" element={<Navigate to="/search" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
    </PreferenceStorageProvider>
  );
}
