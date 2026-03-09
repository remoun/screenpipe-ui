import { useState, useEffect, useCallback, useRef } from "react";

function isTypingElement(element: EventTarget | null): boolean {
  if (!element || !(element instanceof HTMLElement)) return false;
  const tag = element.tagName.toLowerCase();
  const role = element.getAttribute?.("role");
  const editable = element.getAttribute?.("contenteditable");
  return (
    tag === "input" ||
    tag === "textarea" ||
    tag === "select" ||
    role === "textbox" ||
    role === "searchbox" ||
    editable === "true"
  );
}

export interface UseKeyboardNavigationOptions {
  /** Total number of items (cards) to navigate */
  itemCount: number;
}

export interface UseKeyboardNavigationReturn {
  /** Index of currently selected item (0-based) */
  selectedIndex: number;
  /** Set selected index (e.g. when clicking an item) */
  setSelectedIndex: (index: number) => void;
  /** Index of expanded item, or null if none */
  expandedIndex: number | null;
  /** Toggle expanded state for the given index */
  toggleExpanded: (index: number) => void;
  /** Ref for the selected element (for scroll-into-view) */
  selectedRef: React.RefObject<HTMLDivElement | null>;
}

export function useKeyboardNavigation({
  itemCount,
}: UseKeyboardNavigationOptions): UseKeyboardNavigationReturn {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const selectedIndexRef = useRef(selectedIndex);
  const selectedRef = useRef<HTMLDivElement | null>(null);

  selectedIndexRef.current = selectedIndex;

  // Scroll selected item into view
  useEffect(() => {
    selectedRef.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }, [selectedIndex]);

  // Clamp selectedIndex when itemCount changes
  useEffect(() => {
    setSelectedIndex((i) => Math.min(Math.max(0, i), Math.max(0, itemCount - 1)));
  }, [itemCount]);

  const toggleExpanded = useCallback((index: number) => {
    setExpandedIndex((prev) => (prev === index ? null : index));
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (isTypingElement(e.target)) return;

      const key = e.key.toLowerCase();
      if (key === "j" || key === "k" || key === "enter") {
        e.preventDefault();
      }

      if (key === "j") {
        setSelectedIndex((i) => Math.min(i + 1, Math.max(0, itemCount - 1)));
      } else if (key === "k") {
        setSelectedIndex((i) => Math.max(i - 1, 0));
      } else if (key === "enter" && itemCount > 0) {
        const idx = Math.min(
          Math.max(0, selectedIndexRef.current),
          itemCount - 1
        );
        setExpandedIndex((prev) => (prev === idx ? null : idx));
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [itemCount]);

  return {
    selectedIndex,
    setSelectedIndex,
    expandedIndex,
    toggleExpanded,
    selectedRef,
  };
}
