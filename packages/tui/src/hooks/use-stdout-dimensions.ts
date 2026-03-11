import { useState, useEffect } from "react";
import { useStdout } from "ink";

/** Get best available dimensions from stdout or process.stdout (TTY fallback). */
function getDimensions(stream: NodeJS.WriteStream | undefined): [number, number] {
  const fromStream = stream as { columns?: number; rows?: number } | undefined;
  const fromProcess =
    typeof process !== "undefined" && process.stdout
      ? (process.stdout as { columns?: number; rows?: number })
      : undefined;
  const c = Math.max(
    fromStream?.columns ?? 0,
    fromProcess?.columns ?? 0,
    80
  );
  const r = Math.max(
    fromStream?.rows ?? 0,
    fromProcess?.rows ?? 0,
    24
  );
  return [c, r];
}

/** Returns [columns, rows] and updates on terminal resize. */
export function useStdoutDimensions(): [number, number] {
  const { stdout } = useStdout();
  const [dimensions, setDimensions] = useState<[number, number]>(
    () => getDimensions(stdout)
  );

  useEffect(() => {
    setDimensions(getDimensions(stdout));
    // Delayed sync: TTY often reports correct dimensions only after first paint
    const t = setTimeout(() => setDimensions(getDimensions(stdout)), 50);
    return () => clearTimeout(t);
  }, [stdout]);

  useEffect(() => {
    if (!stdout) return;
    const onResize = () => setDimensions(getDimensions(stdout));
    stdout.on("resize", onResize);
    return () => stdout.off("resize", onResize);
  }, [stdout]);

  return dimensions;
}
