import {describe, expect, it} from "vitest";

import {buildTocPath} from "@/stories/content-toc/content-toc.geometry";

describe("Content TOC story geometry", () => {
  const rows = [
    {depth: 2, height: 36, top: 0},
    {depth: 3, height: 56, top: 36},
    {depth: 4, height: 36, top: 92},
    {depth: 2, height: 36, top: 128},
  ];

  it("renders inward and outward diagonals using measured rows including wrapped titles", () => {
    expect(buildTocPath(rows, "circuit").replace(/\s+/g, " ")).toBe(
      "M 10 0 L 10 30 L 22 42 L 22 86 L 34 98 L 34 122 L 10 134 L 10 164",
    );
  });

  it("renders a straight rail without level transitions", () => {
    expect(buildTocPath(rows, "straight").replace(/\s+/g, " ")).toBe(
      "M 10 0 L 10 36 L 10 92 L 10 128 L 10 164",
    );
  });

  it("renders no rail for an empty list", () => {
    expect(buildTocPath([], "circuit")).toBe("");
  });
});
