import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import type { ContentItem, ScreenpipeUIClient } from "@screenpipe-ui/core";
import { contentTypeLabel } from "@screenpipe-ui/core";
import { useSearch } from "@screenpipe-ui/react";
import { ResultItem } from "../components/result-item.tsx";
import { DetailView } from "../components/detail-view.tsx";
import { useStdoutDimensions } from "../hooks/use-stdout-dimensions.ts";

interface Props {
  client: ScreenpipeUIClient;
}

export function SearchView({ client }: Props) {
  const {
    query,
    results,
    pagination,
    loading,
    error,
    search,
    nextPage,
    prevPage,
    setQuery,
    setContentType,
    contentType,
  } = useSearch(client);

  const [columns, rows] = useStdoutDimensions();
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [detailScrollOffset, setDetailScrollOffset] = useState(0);

  const contentWidth = Math.max(20, columns - 4);
  const detailContentHeight = Math.max(5, rows - 16);

  useEffect(() => {
    search();
  }, []);

  useInput((input, key) => {
    if (detailItem) {
      if (key.escape || key.return) {
        setDetailItem(null);
        setDetailScrollOffset(0);
      } else if (input === "n" && selectedIndex < results.length - 1) {
        setSelectedIndex(selectedIndex + 1);
        setDetailItem(results[selectedIndex + 1]);
        setDetailScrollOffset(0);
      } else if (input === "p" && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
        setDetailItem(results[selectedIndex - 1]);
        setDetailScrollOffset(0);
      } else if (input === "j") {
        setDetailScrollOffset((o) => o + 1);
      } else if (input === "k") {
        setDetailScrollOffset((o) => Math.max(0, o - 1));
      }
      return;
    }

    if (inputFocused) {
      if (key.return) {
        setQuery(inputValue);
        search(inputValue);
        setInputFocused(false);
        setSelectedIndex(0);
      }
      if (key.escape) {
        setInputFocused(false);
      }
      return;
    }

    if (input === "/") {
      setInputFocused(true);
      return;
    }

    if (key.return && results.length > 0 && selectedIndex >= 0 && selectedIndex < results.length) {
      setDetailItem(results[selectedIndex]);
      setDetailScrollOffset(0);
      return;
    }

    if (input === "j") {
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    }
    if (input === "k") {
      setSelectedIndex((i) => Math.max(i - 1, 0));
    }
    if (input === "n") {
      nextPage();
      setSelectedIndex(0);
    }
    if (input === "p") {
      prevPage();
      setSelectedIndex(0);
    }
    if (input === "t") {
      const types = ["all", "ocr", "audio", "ui"] as const;
      const idx = types.indexOf(contentType as (typeof types)[number]);
      setContentType(types[(idx + 1) % types.length]);
      search();
    }
  });

  const page = pagination.total > 0
    ? Math.floor(pagination.offset / pagination.limit) + 1
    : 0;
  const totalPages = pagination.total > 0
    ? Math.ceil(pagination.total / pagination.limit)
    : 0;

  return (
    <Box flexDirection="column">
      {/* Search input */}
      <Box gap={1}>
        <Text color="yellow" bold>
          {">"}
        </Text>
        {inputFocused ? (
          <TextInput
            value={inputValue}
            onChange={setInputValue}
            placeholder="search screenpipe..."
          />
        ) : (
          <Text dimColor>{inputValue || query || "press / to search"}</Text>
        )}
        <Box flexGrow={1} />
        <Text color="magenta" bold>
          [{contentType}]
        </Text>
        <Text dimColor>t: type | Enter: view</Text>
      </Box>

      <Box marginTop={1} marginBottom={1}>
        <Text color="gray">{"─".repeat(contentWidth)}</Text>
      </Box>

      {/* Loading */}
      {loading && (
        <Box gap={1}>
          <Text color="cyan">
            <Spinner type="dots" />
          </Text>
          <Text>Searching...</Text>
        </Box>
      )}

      {/* Error */}
      {error && (
        <Box>
          <Text color="red" bold>
            Error: {error}
          </Text>
        </Box>
      )}

      {/* Detail view */}
      {detailItem && (
        <DetailView
          item={detailItem}
          scrollOffset={detailScrollOffset}
          contentWidth={contentWidth}
          contentHeight={detailContentHeight}
          itemPosition={results.length > 1 ? { current: selectedIndex + 1, total: results.length } : undefined}
        />
      )}

      {/* Results */}
      {!detailItem && !loading && results.length === 0 && !error && (
        <Text dimColor>No results. Try a different query or press / to search.</Text>
      )}

      {!detailItem &&
        !loading &&
        results.map((item, idx) => (
          <ResultItem
            key={idx}
            item={item}
            selected={idx === selectedIndex}
            contentWidth={contentWidth}
          />
        ))}

      {/* Pagination footer */}
      {pagination.total > 0 && (
        <Box marginTop={1} gap={2}>
          <Text dimColor>
            {pagination.total} results | page {page}/{totalPages}
          </Text>
          <Text dimColor>n: next | p: prev | j/k: navigate | Enter: view</Text>
        </Box>
      )}
    </Box>
  );
}
