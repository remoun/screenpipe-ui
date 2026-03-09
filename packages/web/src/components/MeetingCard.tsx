import type { ContentItem } from "@screenpipe-ui/core";
import {
  getContentAppName,
  getContentTimestamp,
  formatTime,
  timeAgo,
} from "@screenpipe-ui/core";
import { ExpandableContentCard } from "./ExpandableContentCard";

export interface MeetingCardProps {
  item: ContentItem;
  selected?: boolean;
  expanded?: boolean;
  onExpandedChange?: (expanded: boolean) => void;
  onSelect?: () => void;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export function MeetingCard({
  item,
  selected = false,
  expanded,
  onExpandedChange,
  onSelect,
  innerRef,
}: MeetingCardProps) {
  const appName = getContentAppName(item);
  const timestamp = getContentTimestamp(item);

  return (
    <div ref={innerRef} onClick={onSelect}>
      <ExpandableContentCard
        item={item}
        summary={
        <div className="flex items-center gap-3 w-full">
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
        </div>
      }
      summaryClassName="flex items-center gap-3"
      selected={selected}
      expanded={expanded}
      onExpandedChange={onExpandedChange}
    />
    </div>
  );
}
