import type { ContentItem } from "../types.ts";

export function truncate(text: string, maxLen: number = 80): string {
  if (text.length <= maxLen) return text;
  return text.slice(0, maxLen - 1) + "\u2026";
}

export function contentTypeLabel(item: ContentItem): string {
  switch (item.type) {
    case "OCR":
      return "screen";
    case "Audio":
      return "audio";
    case "UI":
      return "ui";
  }
}

export function highlightMatch(text: string, query: string): string {
  if (!query) return text;
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(`(${escaped})`, "gi");
  return text.replace(re, "\x1b[1;33m$1\x1b[0m");
}

export function stripAnsi(text: string): string {
  return text.replace(/\x1b\[[0-9;]*m/g, "");
}

export function contentPreview(item: ContentItem, maxLen: number = 80): string {
  switch (item.type) {
    case "OCR":
      return truncate(item.content.text.replace(/\n/g, " "), maxLen);
    case "Audio":
      return truncate(item.content.transcription.replace(/\n/g, " "), maxLen);
    case "UI":
      return truncate(item.content.text.replace(/\n/g, " "), maxLen);
  }
}
