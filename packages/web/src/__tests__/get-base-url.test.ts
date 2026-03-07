import { describe, test, expect } from "bun:test";
import { getBaseUrl } from "../get-base-url";

describe("getBaseUrl", () => {
  test("returns ?url= value when provided", () => {
    expect(getBaseUrl("?url=http://from-query:3030", undefined)).toBe(
      "http://from-query:3030"
    );
  });

  test("returns envBaseUrl when ?url= not provided", () => {
    expect(getBaseUrl("", "http://from-env:3030")).toBe("http://from-env:3030");
  });

  test("returns undefined when neither provided", () => {
    expect(getBaseUrl("", undefined)).toBeUndefined();
  });

  test("?url= overrides envBaseUrl", () => {
    expect(
      getBaseUrl("?url=http://from-query:3030", "http://from-env:3030")
    ).toBe("http://from-query:3030");
  });
});
