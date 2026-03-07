import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import type { ScreenpipeUIClient, ContentItem } from "@screenpipe-ui/core";
import {
  contentPreview,
  contentTypeLabel,
  formatTime,
  getContentAppName,
  getContentTimestamp,
} from "@screenpipe-ui/core";
import { useTimeline } from "@screenpipe-ui/react";

interface Props {
  client: ScreenpipeUIClient;
}

interface HourGroup {
  hour: string;
  items: ContentItem[];
}

function groupByHour(items: ContentItem[]): HourGroup[] {
  const groups = new Map<string, ContentItem[]>();

  for (const item of items) {
    const ts = getContentTimestamp(item);
    const date = new Date(ts);
    const hourKey = `${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} ${date.getHours().toString().padStart(2, "0")}:00`;

    const existing = groups.get(hourKey) ?? [];
    existing.push(item);
    groups.set(hourKey, existing);
  }

  return Array.from(groups.entries()).map(([hour, items]) => ({
    hour,
    items,
  }));
}

export function TimelineView({ client }: Props) {
  const { items, loading, error, load, startTime, endTime } =
    useTimeline(client);

  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    load();
  }, []);

  useInput((input) => {
    if (input === "j") {
      setScrollOffset((o) => Math.min(o + 1, Math.max(0, items.length - 10)));
    }
    if (input === "k") {
      setScrollOffset((o) => Math.max(o - 1, 0));
    }
    if (input === "r") {
      load();
      setScrollOffset(0);
    }
  });

  const groups = groupByHour(items);

  // Flatten for display with scroll
  const flatRows: Array<{ type: "header"; text: string } | { type: "item"; item: ContentItem; idx: number }> = [];
  let globalIdx = 0;
  for (const group of groups) {
    flatRows.push({ type: "header", text: group.hour });
    for (const item of group.items) {
      flatRows.push({ type: "item", item, idx: globalIdx });
      globalIdx++;
    }
  }

  const visibleRows = flatRows.slice(scrollOffset, scrollOffset + 20);

  return (
    <Box flexDirection="column">
      <Box gap={2} marginBottom={1}>
        <Text color="cyan" bold>
          Timeline
        </Text>
        <Text dimColor>
          {new Date(startTime).toLocaleDateString()} -{" "}
          {new Date(endTime).toLocaleTimeString()}
        </Text>
        <Box flexGrow={1} />
        <Text dimColor>{items.length} items | r: reload | j/k: scroll</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">{"─".repeat(76)}</Text>
      </Box>

      {loading && (
        <Box gap={1}>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text>Loading timeline...</Text>
        </Box>
      )}

      {error && (
        <Text color="red" bold>
          Error: {error}
        </Text>
      )}

      {!loading && items.length === 0 && !error && (
        <Text dimColor>No timeline items for today. Press r to reload.</Text>
      )}

      {!loading &&
        visibleRows.map((row, i) => {
          if (row.type === "header") {
            return (
              <Box key={`h-${i}`} marginTop={i > 0 ? 1 : 0}>
                <Text color="yellow" bold>
                  {row.text}
                </Text>
              </Box>
            );
          }
          const label = contentTypeLabel(row.item);
          const app = getContentAppName(row.item);
          const time = formatTime(getContentTimestamp(row.item));
          const preview = contentPreview(row.item, 50);

          const typeColor =
            row.item.type === "OCR"
              ? "blue"
              : row.item.type === "Audio"
                ? "green"
                : "magenta";

          return (
            <Box key={`i-${i}`} gap={1}>
              <Text color="gray">{time}</Text>
              <Text color={typeColor} bold>
                {label.padEnd(6)}
              </Text>
              <Text color="white" bold>
                {(app ?? "").slice(0, 12).padEnd(12)}
              </Text>
              <Text dimColor>{preview}</Text>
            </Box>
          );
        })}

      {flatRows.length > 20 && (
        <Box marginTop={1}>
          <Text dimColor>
            Showing {scrollOffset + 1}-
            {Math.min(scrollOffset + 20, flatRows.length)} of {flatRows.length}{" "}
            rows
          </Text>
        </Box>
      )}
    </Box>
  );
}
