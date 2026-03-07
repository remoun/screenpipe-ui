import { describe, test, expect } from "bun:test";
import { $ } from "bun";

const CLI = "packages/cli/src/index.ts";

describe("CLI", () => {
  test("shows help", async () => {
    const result = await $`bun run ${CLI} --help`.text();
    expect(result).toContain("screenpipe-ui");
    expect(result).toContain("search");
    expect(result).toContain("health");
    expect(result).toContain("activity");
  });

  test("shows version", async () => {
    const result = await $`bun run ${CLI} --version`.text();
    expect(result.trim()).toBe("0.1.0");
  });

  test("search command shows help", async () => {
    const result = await $`bun run ${CLI} search --help`.text();
    expect(result).toContain("search query");
    expect(result).toContain("--type");
    expect(result).toContain("--limit");
  });

  test("health command shows help", async () => {
    const result = await $`bun run ${CLI} health --help`.text();
    expect(result).toContain("health");
    expect(result).toContain("--url");
  });

  test("activity command shows help", async () => {
    const result = await $`bun run ${CLI} activity --help`.text();
    expect(result).toContain("activity");
    expect(result).toContain("--today");
    expect(result).toContain("--app");
  });

  test("health uses --url when provided", async () => {
    const proc = await $`bun run ${CLI} health --url http://from-flag:9999 2>&1`.nothrow();
    expect(proc.exitCode).toBe(1);
    expect(proc.stdout.toString()).toContain("from-flag:9999");
  });

  test("health uses SCREENPIPE_BASE_URL when --url not provided", async () => {
    const proc = await $`SCREENPIPE_BASE_URL=http://from-env:8888 bun run ${CLI} health 2>&1`.nothrow();
    expect(proc.exitCode).toBe(1);
    expect(proc.stdout.toString()).toContain("from-env:8888");
  });
});
