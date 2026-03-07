import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import type { ScreenpipeUIClient, ContentItem } from "@screenpipe-ui/core";
import {
  formatTime,
  getContentAppName,
  getContentText,
  getContentTimestamp,
  truncate,
} from "@screenpipe-ui/core";
import { useTimeline } from "@screenpipe-ui/react";

interface Props {
  client: ScreenpipeUIClient;
}

export function MeetingsView({ client }: Props) {
  const { items, loading, error, load } = useTimeline(client);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const audioItems = items.filter((item) => item.type === "Audio");

  useEffect(() => {
    load();
  }, []);

  useInput((input, key) => {
    if (input === "j") {
      setSelectedIndex((i) => Math.min(i + 1, audioItems.length - 1));
    }
    if (input === "k") {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (key.return) {
      setExpandedIndex((prev) =>
        prev === selectedIndex ? null : selectedIndex
      );
    }
    if (input === "r") {
      load();
      setSelectedIndex(0);
      setExpandedIndex(null);
    }
  });

  return (
    <Box flexDirection="column">
      <Box gap={2} marginBottom={1}>
        <Text color="green" bold>
          Meetings / Audio
        </Text>
        <Box flexGrow={1} />
        <Text dimColor>
          {audioItems.length} recordings | r: reload | j/k: navigate | Enter:
          expand
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">{"─".repeat(76)}</Text>
      </Box>

      {loading && (
        <Box gap={1}>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text>Loading audio items...</Text>
        </Box>
      )}

      {error && (
        <Text color="red" bold>
          Error: {error}
        </Text>
      )}

      {!loading && audioItems.length === 0 && !error && (
        <Text dimColor>No audio recordings found. Press r to reload.</Text>
      )}

      {!loading &&
        audioItems.map((item, idx) => {
          const isSelected = idx === selectedIndex;
          const isExpanded = idx === expandedIndex;
          const time = formatTime(getContentTimestamp(item));
          const device = getContentAppName(item);
          const text = getContentText(item);

          return (
            <Box key={idx} flexDirection="column">
              <Box gap={1}>
                <Text color={isSelected ? "cyan" : "gray"}>
                  {isSelected ? ">" : " "}
                </Text>
                <Text color="gray">{time}</Text>
                <Text color="green" bold>
                  {(device ?? "mic").slice(0, 16).padEnd(16)}
                </Text>
                <Text color={isSelected ? "white" : undefined} dimColor={!isSelected}>
                  {truncate(text.replace(/\n/g, " "), 50)}
                </Text>
              </Box>

              {isExpanded && (
                <Box
                  marginLeft={4}
                  marginTop={0}
                  marginBottom={1}
                  borderStyle="round"
                  borderColor="green"
                  paddingX={1}
                  flexDirection="column"
                >
                  <Text color="white">{text}</Text>
                </Box>
              )}
            </Box>
          );
        })}
    </Box>
  );
}
