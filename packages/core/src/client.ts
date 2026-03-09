import type {
  ScreenpipeQueryParams,
  ScreenpipeResponse,
  ContentItem,
} from "@screenpipe/js";

export interface HealthCheckResponse {
  status: string;
  status_code: number;
  last_frame_timestamp?: string;
  last_audio_timestamp?: string;
  frame_status: string;
  audio_status: string;
  message: string;
}

export interface ScreenpipeClientConfig {
  baseUrl?: string;
}

const DEFAULT_BASE_URL = "http://localhost:3030";

export class ScreenpipeUIClient {
  private baseUrl: string;

  constructor(config?: ScreenpipeClientConfig) {
    this.baseUrl = (config?.baseUrl ?? DEFAULT_BASE_URL).replace(/\/+$/, "");
  }

  private async get<T>(path: string, params?: Record<string, unknown>): Promise<T> {
    const qs = new URLSearchParams();
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null || value === "") continue;
        const snakeKey = key.replace(/[A-Z]/g, (m) => `_${m.toLowerCase()}`);
        if (Array.isArray(value)) {
          if (value.length > 0) qs.append(snakeKey, value.join(","));
        } else {
          qs.append(snakeKey, String(value));
        }
      }
    }
    const url = `${this.baseUrl}${path}${qs.toString() ? `?${qs}` : ""}`;
    const res = await fetch(url);
    if (!res.ok) {
      const body = await res.text().catch(() => "");
      throw new Error(`GET ${path} failed (${res.status}): ${body}`);
    }
    return res.json();
  }

  async search(params: ScreenpipeQueryParams = {}): Promise<ScreenpipeResponse> {
    const apiParams = { ...params } as Record<string, unknown>;
    // API expects "accessibility" for UI/accessibility-tree content, not "ui"
    if (apiParams.contentType === "ui") {
      apiParams.contentType = "accessibility";
    }
    return this.get<ScreenpipeResponse>("/search", apiParams);
  }

  async health(): Promise<HealthCheckResponse> {
    return this.get<HealthCheckResponse>("/health");
  }

  getFrameUrl(frameId: number): string {
    return `${this.baseUrl}/frames/${frameId}`;
  }
}

export function createClient(config?: ScreenpipeClientConfig): ScreenpipeUIClient {
  return new ScreenpipeUIClient(config);
}

export function getContentText(item: ContentItem): string {
  switch (item.type) {
    case "OCR":
      return item.content.text;
    case "Audio":
      return item.content.transcription;
    case "UI":
      return item.content.text;
  }
}

export function getContentTimestamp(item: ContentItem): string {
  return item.content.timestamp;
}

export function getContentAppName(item: ContentItem): string {
  switch (item.type) {
    case "OCR":
      return item.content.appName;
    case "Audio":
      return item.content.deviceName;
    case "UI":
      return item.content.appName;
  }
}

export type { ScreenpipeQueryParams, ScreenpipeResponse, ContentItem };
