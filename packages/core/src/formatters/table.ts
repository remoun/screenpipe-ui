export interface Column {
  header: string;
  width: number;
  align?: "left" | "right";
}

export function formatTable(columns: Column[], rows: string[][]): string {
  const divider = columns.map((c) => "\u2500".repeat(c.width)).join("\u2500\u252c\u2500");
  const headerRow = columns
    .map((c) => pad(c.header, c.width, c.align))
    .join(" \u2502 ");

  const dataRows = rows.map((row) =>
    columns
      .map((c, i) => pad(row[i] ?? "", c.width, c.align))
      .join(" \u2502 ")
  );

  return [headerRow, divider, ...dataRows].join("\n");
}

function pad(text: string, width: number, align: "left" | "right" = "left"): string {
  const visible = text.replace(/\x1b\[[0-9;]*m/g, "");
  const padding = Math.max(0, width - visible.length);
  if (align === "right") {
    return " ".repeat(padding) + text;
  }
  return text + " ".repeat(padding);
}
