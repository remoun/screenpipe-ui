import React, { useState, useMemo } from "react";
import { Box, Text, useApp, useInput } from "ink";
import { createClient } from "@screenpipe-ui/core";
import { SearchView } from "./views/search-view.tsx";
import { TimelineView } from "./views/timeline-view.tsx";
import { MeetingsView } from "./views/meetings-view.tsx";
import { StatusBar } from "./components/status-bar.tsx";
import { useStdoutDimensions } from "./hooks/use-stdout-dimensions.ts";

const TABS = ["Search", "Timeline", "Meetings"] as const;
type Tab = (typeof TABS)[number];

export function App({ baseUrl }: { baseUrl?: string }) {
  const app = useApp();
  const [columns] = useStdoutDimensions();
  const dividerWidth = Math.max(20, columns - 2);
  const client = useMemo(
    () => createClient(baseUrl ? { baseUrl } : undefined),
    [baseUrl]
  );
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

  return (
    <Box flexDirection="column" width="100%">
      {/* Tab bar */}
      <Box paddingX={1} gap={1}>
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
      <Box paddingX={1}>
        <Text color="gray">{"─".repeat(dividerWidth)}</Text>
      </Box>

      {/* Active view */}
      <Box flexDirection="column" paddingX={1} flexGrow={1}>
        {activeTab === "Search" && <SearchView client={client} />}
        {activeTab === "Timeline" && <TimelineView client={client} />}
        {activeTab === "Meetings" && <MeetingsView client={client} />}
      </Box>

      {/* Status bar */}
      <StatusBar client={client} />
    </Box>
  );
}
