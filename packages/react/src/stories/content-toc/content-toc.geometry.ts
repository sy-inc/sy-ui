export interface TocRow {
  depth: number;
  height: number;
  top: number;
}

export function buildTocPath(rows: TocRow[], variant: "straight" | "circuit"): string {
  const x = (row: TocRow) => (variant === "straight" ? 10 : 10 + (row.depth - 2) * 12);

  return rows
    .map((row, index) => {
      const previous = rows[index - 1];
      const next = rows[index + 1];
      const start = !previous
        ? `M ${x(row)} ${row.top}`
        : x(previous) !== x(row)
          ? `L ${x(row)} ${row.top + 6}`
          : "";
      const end = row.top + row.height - (next && x(next) !== x(row) ? 6 : 0);

      return `${start} L ${x(row)} ${end}`;
    })
    .join(" ");
}
