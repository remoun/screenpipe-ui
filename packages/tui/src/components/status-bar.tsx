import React, { useEffect } from "react";
import { Box, Text } from "ink";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";
import { useHealth } from "@screenpipe-ui/react";

interface Props {
  client: ScreenpipeUIClient;
}

export function StatusBar({ client }: Props) {
  const { health, loading, error, check } = useHealth(client);

  useEffect(() => {
    check();
    const interval = setInterval(check, 15_000);
    return () => clearInterval(interval);
  }, []);

  const statusColor = error
    ? "red"
    : health?.status === "ok"
      ? "green"
      : "yellow";

  const statusText = loading
    ? "checking..."
    : error
      ? "disconnected"
      : health
        ? `${health.status} | frame: ${health.frame_status} | audio: ${health.audio_status}`
        : "unknown";

  return (
    <>
      <Box paddingX={1}>
        <Text color="gray">{"─".repeat(78)}</Text>
      </Box>
      <Box paddingX={1} gap={1}>
        <Text color={statusColor} bold>
          {"●"}
        </Text>
        <Text color={statusColor}>{statusText}</Text>
        <Box flexGrow={1} />
        <Text dimColor>screenpipe-tui</Text>
      </Box>
    </>
  );
}
