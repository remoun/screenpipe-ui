import React, { memo } from "react";
import { Box, Text } from "ink";
import type { ContentItem } from "@screenpipe-ui/core";
import {
  contentPreview,
  contentTypeLabel,
  timeAgo,
  getContentAppName,
  getContentTimestamp,
} from "@screenpipe-ui/core";

/** Fixed width: cursor(1) + label(6) + ago(8) + app(12) + gaps(4) = 31 */
const FIXED_WIDTH = 31;

interface Props {
  item: ContentItem;
  selected: boolean;
  /** Total content width; preview uses the remainder. Default 80 if not provided. */
  contentWidth?: number;
}

export const ResultItem = memo(function ResultItem({ item, selected, contentWidth = 80 }: Props) {
  const label = contentTypeLabel(item);
  const app = getContentAppName(item);
  const ts = getContentTimestamp(item);
  const ago = timeAgo(ts);
  const previewMaxLen = Math.max(10, (contentWidth ?? 80) - FIXED_WIDTH);
  const preview = contentPreview(item, previewMaxLen);

  const typeColor =
    item.type === "OCR"
      ? "blue"
      : item.type === "Audio"
        ? "green"
        : "magenta";

  return (
    <Box gap={1}>
      <Text color={selected ? "cyan" : "gray"}>
        {selected ? ">" : " "}
      </Text>
      <Text color={typeColor} bold>
        {label.padEnd(6)}
      </Text>
      <Text color="gray">{ago.padEnd(8)}</Text>
      <Text color="white" bold>
        {(app ?? "").slice(0, 12).padEnd(12)}
      </Text>
      <Text color={selected ? "white" : undefined} dimColor={!selected}>
        {preview}
      </Text>
    </Box>
  );
});
