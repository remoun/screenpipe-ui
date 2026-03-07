import { useState } from "react";
import type { ContentItem } from "@screenpipe-ui/core";
import {
  getContentAppName,
  getContentTimestamp,
  getContentText,
  formatTime,
  timeAgo,
} from "@screenpipe-ui/core";

export function MeetingCard({ item }: { item: ContentItem }) {
  const [expanded, setExpanded] = useState(false);
  const appName = getContentAppName(item);
  const timestamp = getContentTimestamp(item);
  const transcription = getContentText(item);

  return (
    <div className="border border-gray-800 rounded-lg overflow-hidden">
      <button
        type="button"
        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-800/30 transition-colors"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-purple-900/40 text-purple-400 text-xs font-medium shrink-0">
          A
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium text-gray-200 truncate">
            {appName}
          </div>
          <div className="text-xs text-gray-500">
            {formatTime(timestamp)} &middot; {timeAgo(timestamp)}
          </div>
        </div>
        <svg
          className={`w-4 h-4 text-gray-500 transition-transform ${
            expanded ? "rotate-180" : ""
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800/50">
          <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap pt-3">
            {transcription}
          </p>
        </div>
      )}
    </div>
  );
}
