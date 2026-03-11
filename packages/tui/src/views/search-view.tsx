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
  contentHeight: number;
}

const SEARCH_CHROME = 6; // input(1) + divider(3) + pagination(2)
const MAX_PAGE_SIZE = 120;

export function SearchView({ client, contentHeight }: Props) {
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

  const [columns] = useStdoutDimensions();
  const [inputFocused, setInputFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");
  const [detailItem, setDetailItem] = useState<ContentItem | null>(null);
  const [detailScrollOffset, setDetailScrollOffset] = useState(0);

  const contentWidth = Math.max(20, columns - 4);
  const listRows = Math.min(MAX_PAGE_SIZE, Math.max(5, contentHeight - SEARCH_CHROME));
  const detailContentHeight = Math.max(5, listRows - 2);

  const [scrollOffset, setScrollOffset] = useState(0);

  useEffect(() => {
    search(undefined, { limit: listRows });
  }, [listRows, search]);

  // Keep selection in view when listRows or results change (e.g. terminal resize)
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
      } else if ((input === "n" || key.rightArrow) && selectedIndex < results.length - 1) {
        setSelectedIndex(selectedIndex + 1);
        setDetailItem(results[selectedIndex + 1]);
        setDetailScrollOffset(0);
      } else if ((input === "p" || key.leftArrow) && selectedIndex > 0) {
        setSelectedIndex(selectedIndex - 1);
        setDetailItem(results[selectedIndex - 1]);
        setDetailScrollOffset(0);
      } else if (input === "j" || key.downArrow) {
        setDetailScrollOffset((o) => o + 1);
      } else if (input === "k" || key.upArrow) {
        setDetailScrollOffset((o) => Math.max(0, o - 1));
      }
      return;
    }

    if (inputFocused) {
      if (key.return) {
        setQuery(inputValue);
        search(inputValue, { limit: listRows });
        setInputFocused(false);
        setSelectedIndex(0);
        setScrollOffset(0);
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

    if (input === "j" || key.downArrow) {
      setSelectedIndex((i) => {
        const next = Math.min(i + 1, results.length - 1);
        setScrollOffset((s) => {
          if (next >= s + listRows) return next - listRows + 1;
          return s;
        });
        return next;
      });
    }
    if (input === "k" || key.upArrow) {
      setSelectedIndex((i) => {
        const next = Math.max(i - 1, 0);
        setScrollOffset((s) => {
          if (next < s) return next;
          return s;
        });
        return next;
      });
    }
    if (input === "n" || key.rightArrow) {
      nextPage({ limit: listRows });
      setSelectedIndex(0);
      setScrollOffset(0);
    }
    if (input === "p" || key.leftArrow) {
      prevPage({ limit: listRows });
      setSelectedIndex(0);
      setScrollOffset(0);
    }
    if (input === "t") {
      const types = ["all", "ocr", "audio", "ui"] as const;
      const idx = types.indexOf(contentType as (typeof types)[number]);
      setContentType(types[(idx + 1) % types.length]);
      search(undefined, { limit: listRows });
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

      {/* Content area: always fixed height so status bar stays anchored */}
      <Box flexDirection="column" height={listRows} overflow="hidden">
        {loading && results.length === 0 && (
          <Box gap={1}>
            <Text color="cyan">
              <Spinner type="dots" />
            </Text>
            <Text>Searching...</Text>
          </Box>
        )}
        {!loading && error && (
          <Box>
            <Text color="red" bold>
              Error: {error}
            </Text>
          </Box>
        )}
        {!error && detailItem && (
          <DetailView
            item={detailItem}
            scrollOffset={detailScrollOffset}
            contentWidth={contentWidth}
            contentHeight={detailContentHeight}
            itemPosition={results.length > 1 ? { current: selectedIndex + 1, total: results.length } : undefined}
          />
        )}
        {!loading && !error && !detailItem && results.length === 0 && (
          <Text dimColor>No results. Try a different query or press / to search.</Text>
        )}
        {!error &&
          !detailItem &&
          results.length > 0 &&
          (() => {
            const start = Math.min(scrollOffset, Math.max(0, results.length - listRows));
            const visible = results.slice(start, start + listRows);
            return visible.map((item, i) => (
              <ResultItem
                key={start + i}
                item={item}
                selected={start + i === selectedIndex}
                contentWidth={contentWidth}
              />
            ));
          })()}
      </Box>

      {/* Pagination footer - always reserve space to prevent status bar jump */}
      <Box marginTop={1} minHeight={1} gap={2}>
        {pagination.total > 0 && !detailItem ? (
          <>
            <Text dimColor>
              {loading ? (
                <>
                  <Spinner type="dots" />
                  {" Loading..."}
                </>
              ) : (
                `${pagination.total} results | page ${page}/${totalPages}`
              )}
            </Text>
            <Box flexGrow={1} />
            <Text dimColor>n: next | p: prev | j/k: navigate | Enter: view</Text>
          </>
        ) : null}
      </Box>
    </Box>
  );
}
