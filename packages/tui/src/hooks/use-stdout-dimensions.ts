import { useState, useEffect } from "react";
import { useStdout } from "ink";

/** Returns [columns, rows] and updates on terminal resize. */
export function useStdoutDimensions(): [number, number] {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<[number, number]>(() => {
    const c = stdout?.columns ?? 80;
    const r = stdout?.rows ?? 24;
    return [c > 0 ? c : 80, r > 0 ? r : 24];
  });

  useEffect(() => {
    if (!stdout) return;
    const onResize = () => {
      const c = (stdout.columns ?? 80) || 80;
      const r = (stdout.rows ?? 24) || 24;
      setDimensions([c, r]);
    };
    stdout.on("resize", onResize);
    return () => stdout.off("resize", onResize);
  }, [stdout]);

  return dimensions;
}
