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
  DATE_RANGE_PRESETS,
} from "@screenpipe-ui/core";
import { useTimeline } from "@screenpipe-ui/react";
import { useStdoutDimensions } from "../hooks/use-stdout-dimensions.ts";

interface Props {
  client: ScreenpipeUIClient;
  contentHeight: number;
}

const ROWS_FOR_CHROME = 9; // app + meetings chrome + flicker-fix
const MEETINGS_FIXED_WIDTH = 25; // cursor(1) + time(5) + device(16) + gaps(3)

export function MeetingsView({ client, contentHeight }: Props) {
  const { items, loading, error, load, dateRangePreset, setDateRangePreset } =
    useTimeline(client);
  const [columns, rows] = useStdoutDimensions();
  const contentWidth = Math.max(20, columns - 4);
  const listRows = Math.min(120, Math.max(5, rows - ROWS_FOR_CHROME));
  const [scrollOffset, setScrollOffset] = useState(0);
  const previewMaxLen = Math.max(10, contentWidth - MEETINGS_FIXED_WIDTH);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const audioItems = items.filter((item) => item.type === "Audio");

  useEffect(() => {
    load({ limit: listRows });
  }, [listRows]);

  useEffect(() => {
    setScrollOffset((s) => {
      if (selectedIndex < s) return selectedIndex;
      if (selectedIndex >= s + listRows) return Math.max(0, selectedIndex - listRows + 1);
      return s;
    });
  }, [listRows, selectedIndex]);

  useInput((input, key) => {
    if (input === "j" || key.downArrow) {
      setSelectedIndex((i) => {
        const next = Math.min(i + 1, audioItems.length - 1);
        setScrollOffset((s) => (next >= s + listRows ? next - listRows + 1 : s));
        return next;
      });
    }
    if (input === "k" || key.upArrow) {
      setSelectedIndex((i) => {
        const next = Math.max(i - 1, 0);
        setScrollOffset((s) => (next < s ? next : s));
        return next;
      });
    }
    if (key.return) {
      setExpandedIndex((prev) =>
        prev === selectedIndex ? null : selectedIndex
      );
    }
    if (input === "r") {
      load({ limit: listRows });
      setSelectedIndex(0);
      setScrollOffset(0);
      setExpandedIndex(null);
    }
    if (input === "d") {
      const idx = DATE_RANGE_PRESETS.findIndex((p) => p.value === dateRangePreset);
      const next = DATE_RANGE_PRESETS[(idx + 1) % DATE_RANGE_PRESETS.length];
      setDateRangePreset(next.value);
      load({ limit: listRows });
      setSelectedIndex(0);
      setScrollOffset(0);
      setExpandedIndex(null);
    }
  });

  return (
    <Box flexDirection="column">
      <Box gap={2} marginBottom={1}>
        <Text color="green" bold>
          Meetings / Audio
        </Text>
        <Text dimColor>
          [{DATE_RANGE_PRESETS.find((p) => p.value === dateRangePreset)?.label ?? dateRangePreset}]
        </Text>
        <Box flexGrow={1} />
        <Text dimColor>
          {audioItems.length} recordings | d: date | r: reload | j/k: navigate |
          Enter: expand
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">{"─".repeat(contentWidth)}</Text>
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
        <Text dimColor>
          No audio recordings for this period. Press d to change date, r to
          reload.
        </Text>
      )}

      {!loading &&
        audioItems.length > 0 &&
        (() => {
          const start = Math.min(scrollOffset, Math.max(0, audioItems.length - listRows));
          const visible = audioItems.slice(start, start + listRows);
          return (
            <Box flexDirection="column" height={listRows} overflow="hidden">
              {visible.map((item, i) => {
                const idx = start + i;
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
                        {truncate(text.replace(/\n/g, " "), previewMaxLen)}
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
        })()}

    </Box>
  );
}
