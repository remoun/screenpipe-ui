const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

export function timeAgo(timestamp: string): string {
  const diff = Date.now() - new Date(timestamp).getTime();

  if (diff < MINUTE) return "just now";
  if (diff < HOUR) {
    const mins = Math.floor(diff / MINUTE);
    return `${mins}m ago`;
  }
  if (diff < DAY) {
    const hours = Math.floor(diff / HOUR);
    return `${hours}h ago`;
  }
  const days = Math.floor(diff / DAY);
  return `${days}d ago`;
}

export function formatDuration(ms: number): string {
  if (ms < MINUTE) return `${Math.round(ms / 1000)}s`;
  if (ms < HOUR) return `${Math.floor(ms / MINUTE)}m`;
  const h = Math.floor(ms / HOUR);
  const m = Math.floor((ms % HOUR) / MINUTE);
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export function formatTime(timestamp: string): string {
  return new Date(timestamp).toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDate(timestamp: string): string {
  return new Date(timestamp).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(timestamp: string): string {
  return `${formatDate(timestamp)} ${formatTime(timestamp)}`;
}

export function todayRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now);
  start.setHours(0, 0, 0, 0);
  return {
    start: start.toISOString(),
    end: now.toISOString(),
  };
}
