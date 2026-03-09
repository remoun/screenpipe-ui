import type { ContentItem } from "@screenpipe-ui/core";
import {
  contentTypeLabel,
  contentPreview,
  getContentAppName,
  getContentTimestamp,
  timeAgo,
} from "@screenpipe-ui/core";
import { ExpandableContentCard } from "./ExpandableContentCard";

const typeBadgeColors: Record<string, string> = {
  screen: "bg-blue-900/50 text-blue-400",
  audio: "bg-purple-900/50 text-purple-400",
  ui: "bg-amber-900/50 text-amber-400",
  input: "bg-emerald-900/50 text-emerald-400",
};

export interface SearchResultProps {
  item: ContentItem;
  selected?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onSelect?: () => void;
  /** Ref for scroll-into-view when selected */
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export function SearchResult({
  item,
  selected = false,
  expanded,
  onExpandedChange,
  onSelect,
  innerRef,
}: SearchResultProps) {
  const label = contentTypeLabel(item);
  const badgeColor = typeBadgeColors[label] ?? "bg-gray-800 text-gray-400";
  const appName = getContentAppName(item);
  const timestamp = getContentTimestamp(item);
  const preview = contentPreview(item, 200);

  return (
    <div ref={innerRef} onClick={onSelect}>
      <ExpandableContentCard
        item={item}
        summary={
          <>
            <div className="flex items-center gap-2 mb-2">
              <span
                className={`text-[10px] uppercase tracking-wider font-medium px-2 py-0.5 rounded ${badgeColor}`}
              >
                {label}
              </span>
              <span className="text-xs text-gray-500">{appName}</span>
              <span className="text-xs text-gray-600 ml-auto">
                {timeAgo(timestamp)}
              </span>
            </div>
            <p className="text-sm text-gray-300 font-mono leading-relaxed whitespace-pre-wrap break-words">
              {preview}
            </p>
          </>
        }
        summaryClassName="flex flex-col items-stretch"
        selected={selected}
        expanded={expanded}
        onExpandedChange={onExpandedChange}
      />
    </div>
  );
}
