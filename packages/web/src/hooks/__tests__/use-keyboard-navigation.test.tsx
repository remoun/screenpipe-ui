import { GlobalWindow } from "happy-dom";
if (!globalThis.document) {
  const window = new GlobalWindow();
  Object.assign(globalThis, {
    window,
    document: window.document,
    navigator: window.navigator,
    HTMLElement: window.HTMLElement,
    MutationObserver: window.MutationObserver,
  });
}
import { describe, test, expect, afterEach } from "bun:test";
import { renderHook, act, cleanup } from "@testing-library/react";
import { useKeyboardNavigation } from "../use-keyboard-navigation";

afterEach(() => cleanup());

describe("useKeyboardNavigation", () => {
  test("returns initial state", () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 5 })
    );
    expect(result.current.selectedIndex).toBe(0);
    expect(result.current.expandedIndex).toBeNull();
  });

  test("setSelectedIndex updates selection", () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 5 })
    );
    act(() => {
      result.current.setSelectedIndex(3);
    });
    expect(result.current.selectedIndex).toBe(3);
  });

  test("toggleExpanded expands and collapses", () => {
    const { result } = renderHook(() =>
      useKeyboardNavigation({ itemCount: 5 })
    );
    act(() => {
      result.current.toggleExpanded(2);
    });
    expect(result.current.expandedIndex).toBe(2);
    act(() => {
      result.current.toggleExpanded(2);
    });
    expect(result.current.expandedIndex).toBeNull();
  });

  test("clamps selectedIndex when itemCount changes", () => {
    const { result, rerender } = renderHook(
      ({ count }) => useKeyboardNavigation({ itemCount: count }),
      { initialProps: { count: 10 } }
    );
    act(() => {
      result.current.setSelectedIndex(7);
    });
    expect(result.current.selectedIndex).toBe(7);
    rerender({ count: 3 });
    expect(result.current.selectedIndex).toBe(2);
  });
});
