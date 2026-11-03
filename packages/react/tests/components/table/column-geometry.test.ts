import {
  calculateTableColumnGeometry,
  getTableColumnGroupSegments,
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

  it("supports merging adjacent group members into one segment", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "select", minWidth: 40, pinned: "start", width: 72},
        {id: "dc", width: 100},
        {id: "da", width: 120},
        {id: "name", width: 150},
      ],
      442,
    );
    const deposit = {columns: ["dc", "da"], id: "deposit", label: "存款"};
    const {segments} = getTableColumnGroupSegments(geometry, [deposit]);

    expect(segments.map((segment) => segment.width)).toEqual([72, 220, 150]);
    expect(segments[1]?.group).toBe(deposit);
    expect(segments[0]?.group).toBeUndefined();
    expect(segments[2]?.group).toBeUndefined();
  });

  it("supports splitting a group at the pinned edge", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "a", pinned: "start", width: 80},
        {id: "b", minWidth: 40, pinned: "start", width: 60},
        {id: "c", width: 100},
      ],
      240,
    );
    const deposit = {columns: ["a", "b", "c"], id: "deposit", label: "存款"};
    const {segments} = getTableColumnGroupSegments(geometry, [deposit]);

    expect(segments).toHaveLength(2);
    expect(segments[0]).toMatchObject({
      columnIndex: geometry.byId.get("b")?.index,
      group: deposit,
      pinned: "start",
      pinnedOffset: 0,
      width: 140,
    });
    expect(segments[1]).toMatchObject({group: deposit, pinned: undefined, width: 100});
  });

  it("supports ignoring hidden members and rejecting shared members", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "name", width: 100},
        {id: "dc", width: 100},
      ],
      200,
    );
    const hidden = {columns: ["wc", "wa"], id: "withdraw", label: "提款"};
    const deposit = {columns: ["dc"], id: "deposit", label: "存款"};

    expect(
      getTableColumnGroupSegments(geometry, [hidden, deposit]).segments.some(
        (segment) => segment.group === hidden,
      ),
    ).toBe(false);
    expect(() =>
      getTableColumnGroupSegments(geometry, [deposit, {...hidden, columns: ["dc"]}]),
    ).toThrow("belongs to more than one column group");
  });

  it("supports rejecting duplicate group ids instead of merging unrelated groups", () => {
    const geometry = calculateTableColumnGeometry([{id: "a"}, {id: "b"}], 200);

    expect(() =>
      getTableColumnGroupSegments(geometry, [
        {columns: ["a"], id: "duplicate", label: "First"},
        {columns: ["b"], id: "duplicate", label: "Second"},
      ]),
    ).toThrow("Duplicate table column group id: duplicate");
  });

  it("supports repeated segments after reordering and resizing visible members", () => {
    const group = {columns: ["a", "b", "hidden"], id: "group", label: "Group"};
    const geometry = calculateTableColumnGeometry(
      [
        {id: "b", width: 100},
        {id: "other", width: 80},
        {id: "a", width: 120},
      ],
      300,
      new Map([["a", 160]]),
    );
    const {segments} = getTableColumnGroupSegments(geometry, [group]);

    expect(segments.map(({group, width}) => [group?.id, width])).toEqual([
      ["group", 100],
      [undefined, 80],
      ["group", 160],
    ]);
    expect(
      getTableColumnGroupSegments(geometry, [{...group, columns: ["hidden"]}]).segments,
    ).toEqual([]);
  });

  it("supports end-pinned segments using their innermost column for the shadow", () => {
    const geometry = calculateTableColumnGeometry(
      [
        {id: "a", width: 100},
        {id: "b", pinned: "end", width: 120},
        {id: "c", pinned: "end", width: 80},
      ],
      250,
    );
    const {segments} = getTableColumnGroupSegments(geometry, [
      {columns: ["a", "b", "c"], id: "group", label: "Group"},
    ]);

    expect(segments).toHaveLength(2);
    expect(segments[1]).toMatchObject({columnIndex: 1, pinned: "end", pinnedOffset: 0, width: 200});
  });
});
