import React, { useMemo } from "react";
import { Box, Text } from "ink";
import type { ContentItem } from "@screenpipe-ui/core";
import {
  contentTypeLabel,
  timeAgo,
  getContentAppName,
  getContentTimestamp,
  getContentText,
} from "@screenpipe-ui/core";

function wrapLines(text: string, maxWidth: number): string[] {
  if (maxWidth < 1) return [text];
  const lines: string[] = [];
  for (const para of text.split(/\n/)) {
    let remaining = para;
    while (remaining.length > 0) {
      if (remaining.length <= maxWidth) {
        lines.push(remaining);
        break;
      }
      let split = maxWidth;
      const space = remaining.lastIndexOf(" ", maxWidth);
      if (space > maxWidth / 2) split = space + 1;
      lines.push(remaining.slice(0, split).trimEnd());
      remaining = remaining.slice(split).trimStart();
    }
  }
  return lines;
}

export interface DetailViewProps {
  item: ContentItem;
  scrollOffset: number;
  contentWidth: number;
  contentHeight: number;
  /** When set, shows "n/p: next/prev (3/10)" in the footer */
  itemPosition?: { current: number; total: number };
}

export function DetailView({ item, scrollOffset, contentWidth, contentHeight, itemPosition }: DetailViewProps) {
  const lines = useMemo(
    () => wrapLines(getContentText(item), contentWidth),
    [item, contentWidth],
  );
  const maxOffset = Math.max(0, lines.length - contentHeight);
  const effectiveOffset = Math.min(scrollOffset, maxOffset);
  const visibleLines = lines.slice(effectiveOffset, effectiveOffset + contentHeight);

  return (
    <Box flexDirection="column" borderStyle="single" borderColor="cyan" paddingX={1} paddingY={1}>
      <Box gap={1} marginBottom={1}>
        <Text color="cyan" bold>
          {contentTypeLabel(item)}
        </Text>
        <Text color="gray">{timeAgo(getContentTimestamp(item))}</Text>
        <Text color="white">{(getContentAppName(item) ?? "").slice(0, 20)}</Text>
      </Box>
      <Box flexDirection="column" height={contentHeight} overflow="hidden">
        {visibleLines.map((line, i) => (
          <Text key={i}>{line}</Text>
        ))}
      </Box>
      <Box marginTop={1} gap={2}>
        <Text dimColor>
          Enter/Esc: close
          {lines.length > contentHeight ? ` | j/k: scroll (${effectiveOffset + 1}-${effectiveOffset + visibleLines.length}/${lines.length})` : ""}
          {itemPosition && itemPosition.total > 1 ? ` | n/p: next/prev (${itemPosition.current}/${itemPosition.total})` : ""}
        </Text>
      </Box>
    </Box>
  );
}
