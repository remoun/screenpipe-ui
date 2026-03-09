import { useEffect, useMemo } from "react";
import { useTimeline } from "@screenpipe-ui/react";
import type { ScreenpipeUIClient, ContentItem } from "@screenpipe-ui/core";
import {
  getContentTimestamp,
  getContentAppName,
  contentPreview,
  contentTypeLabel,
  formatTime,
  DATE_RANGE_PRESETS,
} from "@screenpipe-ui/core";
import { ExpandableContentCard } from "../components/ExpandableContentCard";
import { useKeyboardNavigation } from "../hooks/use-keyboard-navigation";

function groupByHour(items: ContentItem[]): Map<string, ContentItem[]> {
  const groups = new Map<string, ContentItem[]>();
  for (const item of items) {
    const ts = getContentTimestamp(item);
    const date = new Date(ts);
    const hourKey = `${date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
    })} ${date.getHours().toString().padStart(2, "0")}:00`;
    const existing = groups.get(hourKey);
    if (existing) {
      existing.push(item);
    } else {
      groups.set(hourKey, [item]);
    }
  }
  return groups;
}

export function TimelinePage({ client }: { client: ScreenpipeUIClient }) {
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

  const appNames = useMemo(() => {
    const names = new Set<string>();
    for (const item of items) {
      names.add(getContentAppName(item));
    }
    return Array.from(names).sort();
  }, [items]);

  const filteredItems = useMemo(() => {
    if (!appFilter) return items;
    return items.filter((item) => getContentAppName(item) === appFilter);
  }, [items, appFilter]);

  const grouped = useMemo(() => groupByHour(filteredItems), [filteredItems]);

  const {
    selectedIndex,
    setSelectedIndex,
    expandedIndex,
    toggleExpanded,
    selectedRef,
  } = useKeyboardNavigation({ itemCount: filteredItems.length });

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Timeline</h1>
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
          {filteredItems.length > 0 && (
            <span className="text-xs text-gray-500">j/k: navigate · Enter: expand</span>
          )}
          {appNames.length > 0 && (
            <select
              value={appFilter ?? ""}
              onChange={(e) =>
                setAppFilter(e.target.value === "" ? undefined : e.target.value)
              }
              className="bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-300 focus:outline-none focus:border-gray-600"
            >
              <option value="">All apps</option>
              {appNames.map((name) => (
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

      {filteredItems.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600 text-sm py-12">
          No timeline items for this period.
        </p>
      )}

      <div className="space-y-6">
        {(() => {
          let globalIndex = 0;
          return Array.from(grouped.entries()).map(([hour, hourItems]) => (
            <div key={hour}>
              <h2 className="text-xs font-medium text-gray-500 uppercase tracking-wider mb-3 sticky top-0 bg-gray-900 py-1">
                {hour}
              </h2>
              <div className="space-y-2 pl-4 border-l border-gray-800">
                {hourItems.map((item, i) => {
                  const idx = globalIndex++;
                  const label = contentTypeLabel(item);
                  return (
                    <div
                      key={`${item.type}-${idx}`}
                      ref={idx === selectedIndex ? selectedRef : undefined}
                      onClick={() => setSelectedIndex(idx)}
                    >
                      <ExpandableContentCard
                        item={item}
                        summary={
                          <div className="flex items-center gap-3 w-full min-w-0">
                            <span className="text-[10px] text-gray-600 shrink-0 w-10">
                              {formatTime(getContentTimestamp(item))}
                            </span>
                            <span className="text-[10px] uppercase tracking-wider text-gray-500 bg-gray-800 px-1.5 py-0.5 rounded shrink-0">
                              {label}
                            </span>
                            <span className="text-xs text-gray-500 shrink-0">
                              {getContentAppName(item)}
                            </span>
                            <p className="text-sm text-gray-400 font-mono truncate min-w-0">
                              {contentPreview(item, 120)}
                            </p>
                          </div>
                        }
                        summaryClassName="flex items-center gap-3"
                        selected={idx === selectedIndex}
                        expanded={expandedIndex === idx}
                        onExpandedChange={() => toggleExpanded(idx)}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ));
        })()}
      </div>
    </div>
  );
}
