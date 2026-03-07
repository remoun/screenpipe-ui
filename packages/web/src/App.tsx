import { useMemo } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router";
import { createClient } from "@screenpipe-ui/core";
import { Layout } from "./components/Layout";
import { SearchPage } from "./pages/SearchPage";
import { TimelinePage } from "./pages/TimelinePage";
import { MeetingsPage } from "./pages/MeetingsPage";

export function App() {
  const client = useMemo(() => createClient(), []);

  return (
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
  );
}
