import React, { useState, useEffect, useMemo } from "react";
import { Box, Text, useInput } from "ink";
import Spinner from "ink-spinner";
import type { ScreenpipeUIClient, ContentItem } from "@screenpipe-ui/core";
import {
  contentPreview,
  contentTypeLabel,
  formatTime,
  getContentAppName,
  getContentTimestamp,
  DATE_RANGE_PRESETS,
} from "@screenpipe-ui/core";
import { useTimeline } from "@screenpipe-ui/react";
import { DetailView } from "../components/detail-view.tsx";
import { useStdoutDimensions } from "../hooks/use-stdout-dimensions.ts";

interface Props {
  client: ScreenpipeUIClient;
  contentHeight: number;
}

const TIMELINE_CHROME = 4; // header(1) + marginBottom(1) + divider(1) + marginBottom(1)

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

export function TimelineView({ client, contentHeight }: Props) {
  const {
    items,
    loading,
    error,
    load,
    startTime,
    endTime,
    dateRangePreset,
    setDateRangePreset,
  } = useTimeline(client);

  const [columns] = useStdoutDimensions();
  const contentWidth = Math.max(20, columns - 4);
  const visibleRows = Math.min(120, Math.max(5, contentHeight - TIMELINE_CHROME));
  const detailContentHeight = Math.max(5, visibleRows - 2);

  const [scrollOffset, setScrollOffset] = useState(0);
  const [selectedFlatIdx, setSelectedFlatIdx] = useState(0);
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [detailScrollOffset, setDetailScrollOffset] = useState(0);

  useEffect(() => {
    load({ limit: visibleRows });
  }, [visibleRows]);

  const groups = groupByHour(items);

  // Flatten for display with scroll
  type FlatRow = { type: "header"; text: string } | { type: "item"; item: ContentItem; idx: number };
  const flatRows: FlatRow[] = useMemo(() => {
    const out: FlatRow[] = [];
    let globalIdx = 0;
    for (const group of groups) {
      out.push({ type: "header", text: group.hour });
      for (const item of group.items) {
        out.push({ type: "item", item, idx: globalIdx });
        globalIdx++;
      }
    }
    return out;
  }, [groups]);

  // Keep selectedFlatIdx in valid range when flatRows changes
  const clampedSelected = Math.min(selectedFlatIdx, Math.max(0, flatRows.length - 1));
  const maxScroll = Math.max(0, flatRows.length - visibleRows);
  const effectiveScroll = Math.min(scrollOffset, maxScroll);

  const findNextItemIdx = (from: number) => {
    for (let i = from + 1; i < flatRows.length; i++) {
      if (flatRows[i].type === "item") return i;
    }
    return from;
  };
  const findPrevItemIdx = (from: number) => {
    for (let i = from - 1; i >= 0; i--) {
      if (flatRows[i].type === "item") return i;
    }
    return from;
  };
  const itemCount = flatRows.filter((r) => r.type === "item").length;
  const currentItemRank = (() => {
    let rank = 0;
    for (let i = 0; i <= clampedSelected && i < flatRows.length; i++) {
      if (flatRows[i].type === "item") rank++;
    }
    return rank;
  })();

  useInput((input, key) => {
    if (detailItem) {
      if (key.escape || key.return) {
        setDetailItem(null);
        setDetailScrollOffset(0);
      } else if (input === "n" || key.rightArrow) {
        const next = findNextItemIdx(clampedSelected);
        if (next !== clampedSelected) {
          const row = flatRows[next];
          if (row.type === "item") {
            setSelectedFlatIdx(next);
            setDetailItem(row.item);
            setDetailScrollOffset(0);
            if (next >= effectiveScroll + visibleRows) {
              setScrollOffset(next - visibleRows + 1);
            }
          }
        }
      } else if (input === "p" || key.leftArrow) {
        const prev = findPrevItemIdx(clampedSelected);
        if (prev !== clampedSelected) {
          const row = flatRows[prev];
          if (row.type === "item") {
            setSelectedFlatIdx(prev);
            setDetailItem(row.item);
            setDetailScrollOffset(0);
            if (prev < effectiveScroll) {
              setScrollOffset(prev);
            }
          }
        }
      } else if (input === "j" || key.downArrow) {
        setDetailScrollOffset((o) => o + 1);
      } else if (input === "k" || key.upArrow) {
        setDetailScrollOffset((o) => Math.max(0, o - 1));
      }
      return;
    }

    if (input === "j" || key.downArrow) {
      const next = Math.min(clampedSelected + 1, Math.max(0, flatRows.length - 1));
      setSelectedFlatIdx(next);
      if (next >= effectiveScroll + visibleRows) {
        setScrollOffset(next - visibleRows + 1);
      }
    }
    if (input === "k" || key.upArrow) {
      const next = Math.max(clampedSelected - 1, 0);
      setSelectedFlatIdx(next);
      if (next < effectiveScroll) {
        setScrollOffset(next);
      }
    }
    if (input === "r") {
      load({ limit: visibleRows });
      setScrollOffset(0);
      setSelectedFlatIdx(0);
    }
    if (input === "d") {
      const idx = DATE_RANGE_PRESETS.findIndex((p) => p.value === dateRangePreset);
      const next = DATE_RANGE_PRESETS[(idx + 1) % DATE_RANGE_PRESETS.length];
      setDateRangePreset(next.value);
      load({ limit: visibleRows });
      setScrollOffset(0);
      setSelectedFlatIdx(0);
    }
    if (key.return) {
      const row = flatRows[clampedSelected];
      if (row?.type === "item") {
        setDetailItem(row.item);
        setDetailScrollOffset(0);
      }
    }
  });

  const visibleSlice = flatRows.slice(effectiveScroll, effectiveScroll + visibleRows);

  return (
    <Box flexDirection="column">
      <Box gap={2} marginBottom={1}>
        <Text color="cyan" bold>
          Timeline
        </Text>
        <Text dimColor>
          {startTime && endTime
            ? `${new Date(startTime).toLocaleDateString()} - ${new Date(endTime).toLocaleTimeString()}`
            : "All time"}
        </Text>
        <Text dimColor> [{DATE_RANGE_PRESETS.find((p) => p.value === dateRangePreset)?.label ?? dateRangePreset}]</Text>
        <Box flexGrow={1} />
        <Text dimColor>{items.length} items | d: date | r: reload | j/k: navigate | Enter: view</Text>
      </Box>

      <Box marginBottom={1}>
        <Text color="gray">{"─".repeat(contentWidth)}</Text>
      </Box>

      {/* Content area: always fixed height so status bar stays anchored */}
      <Box flexDirection="column" height={visibleRows} overflow="hidden">
        {loading && (
          <Box gap={1}>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text>Loading timeline...</Text>
          </Box>
        )}

        {!loading && error && (
          <Text color="red" bold>
            Error: {error}
          </Text>
        )}

        {!loading && items.length === 0 && !error && (
          <Text dimColor>No timeline items for this period. Press d to change date, r to reload.</Text>
        )}

        {!loading && detailItem && (
          <DetailView
            item={detailItem}
            scrollOffset={detailScrollOffset}
            contentWidth={contentWidth}
            contentHeight={detailContentHeight}
            itemPosition={itemCount > 1 ? { current: currentItemRank, total: itemCount } : undefined}
          />
        )}

        {!loading &&
          !detailItem &&
          visibleSlice.map((row, i) => {
            const flatIdx = effectiveScroll + i;
            const selected = flatIdx === clampedSelected;
            if (row.type === "header") {
              return (
                <Box key={`h-${flatIdx}`} marginTop={i > 0 ? 1 : 0} gap={1}>
                  <Text color="gray">{"  "}</Text>
                  <Text color="yellow" bold>
                    {row.text}
                  </Text>
                </Box>
              );
            }
            const label = contentTypeLabel(row.item);
            const app = getContentAppName(row.item);
            const time = formatTime(getContentTimestamp(row.item));
            const previewMaxLen = Math.max(10, contentWidth - 31);
            const preview = contentPreview(row.item, previewMaxLen);

            const typeColor =
              row.item.type === "OCR"
                ? "blue"
                : row.item.type === "Audio"
                  ? "green"
                  : "magenta";

            return (
              <Box key={`i-${flatIdx}`} gap={1}>
                <Text color={selected ? "cyan" : "gray"}>{selected ? ">" : " "}</Text>
                <Text color="gray">{time}</Text>
                <Text color={typeColor} bold>
                  {label.padEnd(6)}
                </Text>
                <Text color="white" bold>
                  {(app ?? "").slice(0, 12).padEnd(12)}
                </Text>
                <Text color={selected ? "white" : undefined} dimColor={!selected}>
                  {preview}
                </Text>
              </Box>
            );
          })}
      </Box>

    </Box>
  );
}
