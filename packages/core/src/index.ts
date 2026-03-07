export {
  ScreenpipeUIClient,
  createClient,
  getContentText,
  getContentTimestamp,
  getContentAppName,
} from "./client.ts";
export type { ScreenpipeClientConfig, HealthCheckResponse } from "./client.ts";

export { createSearchStore } from "./stores/search-store.ts";
export type { SearchState } from "./stores/search-store.ts";

export { createTimelineStore } from "./stores/timeline-store.ts";
export type { TimelineState } from "./stores/timeline-store.ts";

export { createHealthStore } from "./stores/health-store.ts";
export type { HealthState } from "./stores/health-store.ts";

export { timeAgo, formatDuration, formatTime, formatDate, formatDateTime, todayRange } from "./formatters/time.ts";
export { truncate, contentTypeLabel, highlightMatch, stripAnsi, contentPreview } from "./formatters/content.ts";
export { formatTable } from "./formatters/table.ts";
export type { Column } from "./formatters/table.ts";

export type * from "./types.ts";
