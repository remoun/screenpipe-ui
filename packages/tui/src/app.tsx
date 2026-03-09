import React, { useState, useMemo } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { createClient } from "@screenpipe-ui/core";
import { PreferenceStorageProvider } from "@screenpipe-ui/react";
import { createFileConfigAdapter } from "./preference-storage.ts";
import { SearchView } from "./views/search-view.tsx";
import { TimelineView } from "./views/timeline-view.tsx";
import { MeetingsView } from "./views/meetings-view.tsx";
import { StatusBar } from "./components/status-bar.tsx";
import { useStdoutDimensions } from "./hooks/use-stdout-dimensions.ts";

const TABS = ["Search", "Timeline", "Meetings"] as const;
type Tab = (typeof TABS)[number];

export function App({ baseUrl }: { baseUrl?: string }) {
  const app = useApp();
  const [columns, rows] = useStdoutDimensions();
  const dividerWidth = Math.max(20, columns - 2);
  const client = useMemo(
    () => createClient(baseUrl ? { baseUrl } : undefined),
    [baseUrl]
  );
  const preferenceStorage = useMemo(() => createFileConfigAdapter(), []);
  const [activeTab, setActiveTab] = useState<Tab>("Search");

  useInput((input, key) => {
    if (input === "q" && !key.ctrl) {
      app.exit();
    }
    if (key.tab) {
      setActiveTab((prev) => {
        const idx = TABS.indexOf(prev);
        return TABS[(idx + 1) % TABS.length];
      });
    }
  });

  const statusBarHeight = 2; // divider + text row
  const headerHeight = 2; // tab bar + divider
  const contentHeight = Math.max(1, rows - headerHeight - statusBarHeight);

  return (
    <PreferenceStorageProvider value={preferenceStorage}>
    <Box flexDirection="column" width={columns} height={Math.max(1, rows - 1)}>
      {/* Tab bar */}
      <Box paddingX={1} gap={1} flexShrink={0}>
        {TABS.map((tab) => (
          <Text
            key={tab}
            bold={activeTab === tab}
            color={activeTab === tab ? "cyan" : "gray"}
            inverse={activeTab === tab}
          >
            {` ${tab} `}
          </Text>
        ))}
        <Box flexGrow={1} />
        <Text dimColor>Tab: switch | q: quit</Text>
      </Box>

      {/* Divider */}
      <Box paddingX={1} flexShrink={0}>
        <Text color="gray">{"─".repeat(dividerWidth)}</Text>
      </Box>

      {/* Active view - fixed height so status bar stays anchored */}
      <Box flexDirection="column" paddingX={1} height={contentHeight} overflow="hidden">
        {activeTab === "Search" && <SearchView client={client} contentHeight={contentHeight} />}
        {activeTab === "Timeline" && <TimelineView client={client} contentHeight={contentHeight} />}
        {activeTab === "Meetings" && <MeetingsView client={client} contentHeight={contentHeight} />}
      </Box>

      {/* Status bar - anchored at bottom, never shrinks */}
      <Box flexShrink={0}>
        <StatusBar client={client} />
      </Box>
    </Box>
    </PreferenceStorageProvider>
  );
}
