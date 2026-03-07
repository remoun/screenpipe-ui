import { describe, test, expect } from "bun:test";
import { getBaseUrl } from "../get-base-url.ts";

describe("getBaseUrl", () => {
  test("returns --url value when provided", () => {
    expect(
      getBaseUrl(["node", "tui", "--url", "http://from-flag:3030"], {})
    ).toBe("http://from-flag:3030");
  });

  test("returns SCREENPIPE_BASE_URL when --url not provided", () => {
    expect(
      getBaseUrl(["node", "tui"], { SCREENPIPE_BASE_URL: "http://from-env:3030" })
    ).toBe("http://from-env:3030");
  });

  test("returns default when neither provided", () => {
    expect(getBaseUrl(["node", "tui"], {})).toBe("http://localhost:3030");
  });

  test("--url overrides SCREENPIPE_BASE_URL", () => {
    expect(
      getBaseUrl(
        ["node", "tui", "--url", "http://from-flag:3030"],
        { SCREENPIPE_BASE_URL: "http://from-env:3030" }
      )
    ).toBe("http://from-flag:3030");
  });
});
