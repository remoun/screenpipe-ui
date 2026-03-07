/**
 * Resolves the screenpipe API base URL.
 * Precedence: ?url= query param > SCREENPIPE_BASE_URL env > default (undefined = localhost:3030).
 */
export function getBaseUrl(
  search: string,
  envBaseUrl?: string
): string | undefined {
  const qs = new URLSearchParams(search).get("url");
  if (qs) return qs;
  return envBaseUrl || undefined;
}
