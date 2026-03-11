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
import { DetailView } from "../components/detail-view.tsx";

interface Props {
  client: ScreenpipeUIClient;
  contentHeight: number;
}

const MEETINGS_CHROME = 4; // header(1) + marginBottom(1) + divider(1) + marginBottom(1)
// cursor(1) + time(8) + device(16) + gaps(4) - keep preview short so it never wraps
const MEETINGS_FIXED_WIDTH = 29;

export function MeetingsView({ client, contentHeight }: Props) {
  const { items, loading, error, load, dateRangePreset, setDateRangePreset } =
    useTimeline(client);
  const [columns] = useStdoutDimensions();
  const contentWidth = Math.max(20, columns - 4);
  const listRows = Math.min(120, Math.max(5, contentHeight - MEETINGS_CHROME));
  const detailContentHeight = Math.max(5, listRows - 2);
  const [scrollOffset, setScrollOffset] = useState(0);
  const previewMaxLen = Math.max(10, contentWidth - MEETINGS_FIXED_WIDTH);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [detailScrollOffset, setDetailScrollOffset] = useState(0);

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
    if (detailItem) {
      if (key.escape || key.return) {
        setDetailItem(null);
        setDetailScrollOffset(0);
      } else if ((input === "n" || key.rightArrow) && selectedIndex < audioItems.length - 1) {
        setSelectedIndex(selectedIndex + 1);
        setDetailItem(audioItems[selectedIndex + 1]);
        setDetailScrollOffset(0);
      } else if ((input === "p" || key.leftArrow) && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
        setDetailItem(audioItems[selectedIndex - 1]);
        setDetailScrollOffset(0);
      } else if (input === "j" || key.downArrow) {
        setDetailScrollOffset((o) => o + 1);
      } else if (input === "k" || key.upArrow) {
        setDetailScrollOffset((o) => Math.max(0, o - 1));
      }
      return;
    }

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
    if (key.return && audioItems.length > 0 && selectedIndex >= 0 && selectedIndex < audioItems.length) {
      setDetailItem(audioItems[selectedIndex]);
      setDetailScrollOffset(0);
    }
    if (input === "r") {
      load({ limit: listRows });
      setSelectedIndex(0);
      setScrollOffset(0);
      setDetailItem(null);
    }
    if (input === "d") {
      const idx = DATE_RANGE_PRESETS.findIndex((p) => p.value === dateRangePreset);
      const next = DATE_RANGE_PRESETS[(idx + 1) % DATE_RANGE_PRESETS.length];
      setDateRangePreset(next.value);
      load({ limit: listRows });
      setSelectedIndex(0);
      setScrollOffset(0);
      setDetailItem(null);
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
          Enter: view
        </Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">{"─".repeat(contentWidth)}</Text>
      </Box>

      {/* Content area: fixed height for consistent layout */}
      <Box flexDirection="column" height={listRows} overflow="hidden">
        {loading && (
          <Box gap={1}>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text>Loading audio items...</Text>
          </Box>
        )}
        {!loading && error && (
          <Text color="red" bold>
            Error: {error}
          </Text>
        )}
        {!loading && !error && detailItem && (
          <DetailView
            item={detailItem}
            scrollOffset={detailScrollOffset}
            contentWidth={contentWidth}
            contentHeight={detailContentHeight}
            itemPosition={audioItems.length > 1 ? { current: selectedIndex + 1, total: audioItems.length } : undefined}
          />
        )}
        {!loading && !error && !detailItem && audioItems.length === 0 && (
          <Text dimColor>
            No audio recordings for this period. Press d to change date, r to
            reload.
          </Text>
        )}
        {!loading &&
          !error &&
          !detailItem &&
          audioItems.length > 0 &&
          (() => {
            const start = Math.min(scrollOffset, Math.max(0, audioItems.length - listRows));
            const visible = audioItems.slice(start, start + listRows);
            return visible.map((item, i) => {
              const idx = start + i;
              const isSelected = idx === selectedIndex;
              const time = formatTime(getContentTimestamp(item));
              const device = getContentAppName(item);
              const text = getContentText(item);
                return (
                <Box key={idx} gap={1}>
                  <Text color={isSelected ? "cyan" : "gray"}>
                    {isSelected ? ">" : " "}
                  </Text>
                  <Text color="gray">{time.padEnd(8)}</Text>
                  <Text color="green" bold>
                    {(device ?? "mic").slice(0, 16).padEnd(16)}
                  </Text>
                  <Text color={isSelected ? "white" : undefined} dimColor={!isSelected}>
                    {truncate(text.replace(/\n/g, " "), previewMaxLen)}
                  </Text>
                </Box>
              );
            });
          })()}
      </Box>
    </Box>
  );
}
