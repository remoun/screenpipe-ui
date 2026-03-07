import React from "react";
import { Box, Text } from "ink";
import type { ContentItem } from "@screenpipe-ui/core";
import {
  contentPreview,
  contentTypeLabel,
  timeAgo,
  getContentAppName,
  getContentTimestamp,
} from "@screenpipe-ui/core";

interface Props {
  item: ContentItem;
  selected: boolean;
}

export function ResultItem({ item, selected }: Props) {
  const label = contentTypeLabel(item);
  const app = getContentAppName(item);
  const ts = getContentTimestamp(item);
  const ago = timeAgo(ts);
  const preview = contentPreview(item, 48);

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
}
