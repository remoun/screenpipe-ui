import React from "react";
import { describe, it, expect } from "bun:test";
import { render } from "ink-testing-library";
import { Text } from "ink";
import { useStdoutDimensions } from "../use-stdout-dimensions.ts";

function TestComponent() {
  const [columns, rows] = useStdoutDimensions();
  return <Text>{`${columns}x${rows}`}</Text>;
}

describe("useStdoutDimensions", () => {
  it("returns tuple of [columns, rows] from stdout", () => {
    const { lastFrame } = render(<TestComponent />);
    const frame = lastFrame();
    expect(frame).toBeDefined();
    // ink-testing-library mock stdout has columns; fallback gives 80x24 or similar
    expect(frame).toMatch(/\d+x\d+/);
  });
});
