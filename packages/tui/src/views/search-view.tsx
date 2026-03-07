import React, { useState, useEffect } from "react";
import { Box, Text, useInput } from "ink";
import TextInput from "ink-text-input";
import Spinner from "ink-spinner";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";
import { useSearch } from "@screenpipe-ui/react";
import { ResultItem } from "../components/result-item.tsx";

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

  const [inputFocused, setInputFocused] = useState(true);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    search();
  }, []);

  useInput((input, key) => {
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
        <Text dimColor>t: type</Text>
      </Box>

      <Box marginTop={1} marginBottom={1}>
        <Text color="gray">{"─".repeat(76)}</Text>
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

      {/* Results */}
      {!loading && results.length === 0 && !error && (
        <Text dimColor>No results. Try a different query or press / to search.</Text>
      )}

      {!loading &&
        results.map((item, idx) => (
          <ResultItem
            key={idx}
            item={item}
            selected={idx === selectedIndex}
          />
        ))}

      {/* Pagination footer */}
      {pagination.total > 0 && (
        <Box marginTop={1} gap={2}>
          <Text dimColor>
            {pagination.total} results | page {page}/{totalPages}
          </Text>
          <Text dimColor>n: next | p: prev | j/k: navigate</Text>
        </Box>
      )}
    </Box>
  );
}
