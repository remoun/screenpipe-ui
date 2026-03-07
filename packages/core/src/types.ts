export type {
  ContentType,
  ContentItem,
  OCRContent,
  AudioContent,
  UiContent,
  ScreenpipeQueryParams,
  ScreenpipeResponse,
  PaginationInfo,
  Speaker,
} from "@screenpipe/js";

export type { HealthCheckResponse } from "./client.ts";

export interface TimeRange {
  start: string;
  end: string;
}
