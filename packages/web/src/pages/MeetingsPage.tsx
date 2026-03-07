import { useEffect, useMemo } from "react";
import { useTimeline } from "@screenpipe-ui/react";
import type { ScreenpipeUIClient } from "@screenpipe-ui/core";
import { MeetingCard } from "../components/MeetingCard";

export function MeetingsPage({ client }: { client: ScreenpipeUIClient }) {
  const { items, loading, error, load } = useTimeline(client);

  useEffect(() => {
    load();
  }, [load]);

  const audioItems = useMemo(
    () => items.filter((item) => item.type === "Audio"),
    [items],
  );

  return (
    <div className="max-w-3xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-lg font-semibold">Meetings</h1>
        <button
          type="button"
          onClick={load}
          disabled={loading}
          className="px-3 py-1.5 text-xs rounded-md bg-gray-800 text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
        >
          {loading ? "..." : "Refresh"}
        </button>
      </div>

      {error && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-900/20 border border-red-900/50 text-red-400 text-sm">
          {error}
        </div>
      )}

      {audioItems.length === 0 && !loading && !error && (
        <p className="text-center text-gray-600 text-sm py-12">
          No audio transcriptions found for today.
        </p>
      )}

      <div className="flex flex-col gap-3">
        {audioItems.map((item, i) => (
          <MeetingCard key={`audio-${i}`} item={item} />
        ))}
      </div>
    </div>
  );
}
