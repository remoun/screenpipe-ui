import { useEffect, useMemo } from "react";
import { useTimeline } from "@screenpipe-ui/react";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";
import { getContentAppName, DATE_RANGE_PRESETS } from "@screenpipe-ui/core";
import { MeetingCard } from "../components/MeetingCard";
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";

export function MeetingsPage({ client }: { client: ScreenpipeUIClient }) {
  const {
    items,
    appFilter,
    loading,
    error,
    load,
    setAppFilter,
    dateRangePreset,
    setDateRangePreset,
  } = useTimeline(client);

  useEffect(() => {
    load();
  }, [load]);

  const handleDateRangeChange = (preset: (typeof DATE_RANGE_PRESETS)[number]["value"]) => {
    setDateRangePreset(preset);
    load();
  };

  const audioItems = useMemo(() => {
    const filtered = items.filter((item) => item.type === "Audio");
    if (!appFilter) return filtered;
    return filtered.filter((item) => getContentAppName(item) === appFilter);
  }, [items, appFilter]);

  const deviceNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of items) {
      if (item.type === "Audio") {
        names.add(getContentAppName(item));
      }
    }
    return Array.from(names).filter(Boolean).sort();
  }, [items]);

  const {
    selectedIndex,
    setSelectedIndex,
    expandedIndex,
    toggleExpanded,
    selectedRef,
  } = useKeyboardNavigation({ itemCount: audioItems.length });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Meetings</h1>
        <div className="flex items-center gap-4">
          <select
            value={dateRangePreset}
            onChange={(e) =>
              handleDateRangeChange(e.target.value as (typeof DATE_RANGE_PRESETS)[number]["value"])
            }
            className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gray-600"
          >
            {DATE_RANGE_PRESETS.map((p) => (
              <option key={p.value} value={p.value}>
                {p.label}
              </option>
            ))}
          </select>
          {audioItems.length > 0 && (
            <span className="text-xs text-gray-500">j/k: navigate · Enter: expand</span>
          )}
          {deviceNames.length > 0 && (
            <select
              value={appFilter ?? ""}
              onChange={(e) =>
                setAppFilter(e.target.value === "" ? undefined : e.target.value)
              }
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gray-600"
            >
              <option value="">All devices</option>
              {deviceNames.map((name) => (
                <option key={name} value={name}>
                  {name}
                </option>
              ))}
            </select>
          )}
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Refresh"}
        </button>
        </div>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {audioItems.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600 text-sm py-12">
          No audio transcriptions found for this period.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {audioItems.map((item, i) => (
          <MeetingCard
            key={`audio-${i}`}
            item={item}
            selected={i === selectedIndex}
            expanded={expandedIndex === i}
            onExpandedChange={() => toggleExpanded(i)}
            onSelect={() => setSelectedIndex(i)}
            innerRef={i === selectedIndex ? selectedRef : undefined}
          />
        ))}
      </div>
    </div>
  );
}
