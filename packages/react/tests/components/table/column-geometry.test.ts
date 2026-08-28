import {
  calculateTableColumnGeometry,
  getTablePinnedShadowColumns,
  normalizeTableScrollOffset,
} from "@/components/table/table-column-geometry";

describe("Table column geometry", () => {
  it("supports flexible widths and logical pinned offsets", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "selection", pinned: "start", width: 80},
        {id: "name", flex: 1, maxWidth: 240, minWidth: 100},
        {id: "role", flex: 2, minWidth: 100},
        {id: "actions", pinned: "end", width: 120},
      ],
      700,
    );

    expect([...geometry.widths]).toEqual([
      ["selection", 80],
      ["name", 200],
      ["role", 300],
      ["actions", 120],
    ]);
    expect(geometry.byId.get("selection")?.pinnedOffset).toBe(0);
    expect(geometry.byId.get("actions")?.pinnedOffset).toBe(0);
    expect(geometry.totalWidth).toBe(700);
    expect(geometry.hasValidPinnedWidth).toBe(true);
  });

  it("exposes when pinned columns consume the viewport", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "selection", pinned: "start", width: 100},
        {id: "actions", pinned: "end", width: 100},
      ],
      200,
    );

    expect(geometry.hasValidPinnedWidth).toBe(false);
  });

  it("supports redistributing spare width after a flexible column reaches its maximum", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "name", flex: 1, maxWidth: 150, minWidth: 100},
        {id: "role", flex: 1, minWidth: 100},
      ],
      500,
    );

    expect([...geometry.widths]).toEqual([
      ["name", 150],
      ["role", 350],
    ]);
  });

  it("supports clamping resized widths and recalculating following pinned offsets", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "name", maxWidth: 240, minWidth: 100, pinned: "start"},
        {id: "role", minWidth: 100, pinned: "start"},
      ],
      500,
      new Map([["name", 300]]),
    );

    expect(geometry.widths.get("name")).toBe(240);
    expect(geometry.widths.get("role")).toBe(260);
    expect(geometry.byId.get("role")?.pinnedOffset).toBe(240);
  });

  it("supports selecting pinned shadow frontiers as content crosses each logical edge", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "first", pinned: "start", width: 100},
        {id: "second", width: 200},
        {id: "third", pinned: "end", width: 100},
      ],
      250,
    );

    expect(getTablePinnedShadowColumns(geometry, 0)).toEqual({
      end: geometry.byId.get("third"),
    });
    expect(getTablePinnedShadowColumns(geometry, 50)).toEqual({
      end: geometry.byId.get("third"),
      start: geometry.byId.get("first"),
    });
    expect(getTablePinnedShadowColumns(geometry, 150)).toEqual({
      start: geometry.byId.get("first"),
    });
    expect(normalizeTableScrollOffset(-50, 150, "rtl")).toBe(50);
  });

  it("supports rejecting duplicate column ids", () => {
    expect(() =>
      calculateTableColumnGeometry(
        [
          {id: "name", width: 100},
          {id: "name", width: 200},
        ],
        300,
      ),
    ).toThrow("Duplicate table column id: name");
  });
});
