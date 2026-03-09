import { useState } from "react";
import type { ContentItem } from "@screenpipe-ui/core";
import { getContentText } from "@screenpipe-ui/core";

function ChevronDown({ className }: { className?: string }) {
  return (
    <svg
      className={`w-4 h-4 text-gray-500 shrink-0 transition-transform ${className ?? ""}`}
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
  );
}

export interface ExpandableContentCardProps {
  item: ContentItem;
  /** Summary content shown when collapsed (header, preview, etc.) */
  summary: React.ReactNode;
  /** Button class for layout - e.g. "flex items-center gap-3" or "block" */
  summaryClassName?: string;
  /** Controlled expanded state (optional) */
  expanded?: boolean;
  /** Called when expand state changes (for controlled mode) */
  onExpandedChange?: (expanded: boolean) => void;
  /** Visual focus/selection highlight (e.g. for keyboard nav) */
  selected?: boolean;
}

export function ExpandableContentCard({
  item,
  summary,
  summaryClassName = "flex items-center gap-3",
  expanded: controlledExpanded,
  onExpandedChange,
  selected = false,
}: ExpandableContentCardProps) {
  const [internalExpanded, setInternalExpanded] = useState(false);
  const expanded =
    controlledExpanded !== undefined ? controlledExpanded : internalExpanded;
  const setExpanded = (value: boolean) => {
    if (onExpandedChange) {
      onExpandedChange(value);
    } else {
      setInternalExpanded(value);
    }
  };
  const fullText = getContentText(item);

  return (
    <div
      className={`rounded-lg overflow-hidden border transition-colors ${
        selected ? "border-gray-600 ring-1 ring-gray-600" : "border-gray-800"
      }`}
      data-selected={selected ? "true" : undefined}
    >
      <button
        type="button"
        className={`w-full p-4 text-left hover:bg-gray-800/30 transition-colors ${summaryClassName}`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex-1 min-w-0">{summary}</div>
        <span className="ml-auto shrink-0">
          <ChevronDown className={expanded ? "rotate-180" : ""} />
        </span>
      </button>
      {expanded && (
        <div className="px-4 pb-4 border-t border-gray-800/50">
          <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap pt-3 break-words">
            {fullText}
          </p>
        </div>
      )}
    </div>
  );
}
