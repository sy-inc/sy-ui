import type {Key} from "@react-types/shared";

export type TableColumnPinnedSide = "start" | "end";

export interface TableColumnDefinition {
  id: Key;
  flex?: number;
  maxWidth?: number;
  minWidth?: number;
  pinned?: TableColumnPinnedSide;
  width?: number;
}

export interface ResolvedTableColumnGeometry {
  end: number;
  id: Key;
  index: number;
  pinned?: TableColumnPinnedSide;
  pinnedOffset?: number;
  start: number;
  width: number;
}

export interface TableColumnGeometry {
  byId: Map<Key, ResolvedTableColumnGeometry>;
  columns: ResolvedTableColumnGeometry[];
  end: ResolvedTableColumnGeometry[];
  hasHorizontalOverflow: boolean;
  hasValidPinnedWidth: boolean;
  pinnedEndWidth: number;
  pinnedStartWidth: number;
  start: ResolvedTableColumnGeometry[];
  totalWidth: number;
  viewportWidth: number;
  widths: Map<Key, number>;
}

export interface TablePinnedShadowColumns {
  end?: ResolvedTableColumnGeometry;
  start?: ResolvedTableColumnGeometry;
}

const DEFAULT_MIN_WIDTH = 75;

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(value, max));
}

export function calculateTableColumnGeometry(
  definitions: readonly TableColumnDefinition[],
  viewportWidth: number,
  widthOverrides: ReadonlyMap<Key, number> = new Map(),
  fillContainer = false,
): TableColumnGeometry {
  const ids = new Set<Key>();

  for (const definition of definitions) {
    if (ids.has(definition.id)) {
      throw new Error(`Duplicate table column id: ${String(definition.id)}`);
    }

    ids.add(definition.id);
  }

  const resolved = definitions.map((definition) => {
    const minWidth = Math.max(0, definition.minWidth ?? DEFAULT_MIN_WIDTH);
    const maxWidth = Math.max(minWidth, definition.maxWidth ?? Number.MAX_SAFE_INTEGER);
    const overriddenWidth = widthOverrides.get(definition.id);
    const fixedWidth = overriddenWidth ?? definition.width;
    const isFixed = fixedWidth != null;

    return {
      definition,
      flex: isFixed ? 0 : Math.max(0, definition.flex ?? 1),
      isFixed,
      maxWidth,
      width: isFixed ? clamp(fixedWidth ?? 0, minWidth, maxWidth) : minWidth,
    };
  });

  let remainingWidth =
    Math.max(0, viewportWidth) - resolved.reduce((total, column) => total + column.width, 0);
  let flexibleColumns = resolved.filter(
    (column) => column.flex > 0 && column.width < column.maxWidth,
  );

  if (fillContainer && resolved.every((column) => column.isFixed)) {
    flexibleColumns = resolved.filter((column) => column.width < column.maxWidth);
  }

  while (remainingWidth > 0 && flexibleColumns.length > 0) {
    const distributableWidth = remainingWidth;
    const totalFlex = flexibleColumns.reduce((total, column) => total + (column.flex || 1), 0);
    let distributedWidth = 0;

    for (const column of flexibleColumns) {
      const share = distributableWidth * ((column.flex || 1) / totalFlex);
      const addedWidth = Math.min(share, column.maxWidth - column.width);

      column.width += addedWidth;
      distributedWidth += addedWidth;
    }

    if (distributedWidth <= Number.EPSILON) break;

    remainingWidth -= distributedWidth;
    flexibleColumns = flexibleColumns.filter((column) => column.width < column.maxWidth);
  }

  let start = 0;
  const columns = resolved.map<ResolvedTableColumnGeometry>((column, index) => {
    const result = {
      end: start + column.width,
      id: column.definition.id,
      index,
      pinned: column.definition.pinned,
      start,
      width: column.width,
    };

    start = result.end;

    return result;
  });
  const pinnedStart = columns.filter((column) => column.pinned === "start");
  const pinnedEnd = columns.filter((column) => column.pinned === "end");
  let startOffset = 0;

  for (const column of pinnedStart) {
    column.pinnedOffset = startOffset;
    startOffset += column.width;
  }

  let endOffset = 0;

  for (const column of [...pinnedEnd].reverse()) {
    column.pinnedOffset = endOffset;
    endOffset += column.width;
  }

  const totalWidth = columns.reduce((total, column) => total + column.width, 0);
  const pinnedStartWidth = pinnedStart.reduce((total, column) => total + column.width, 0);
  const pinnedEndWidth = pinnedEnd.reduce((total, column) => total + column.width, 0);

  return {
    byId: new Map(columns.map((column) => [column.id, column])),
    columns,
    end: pinnedEnd,
    hasHorizontalOverflow: totalWidth > viewportWidth,
    hasValidPinnedWidth: viewportWidth <= 0 || pinnedStartWidth + pinnedEndWidth < viewportWidth,
    pinnedEndWidth,
    pinnedStartWidth,
    start: pinnedStart,
    totalWidth,
    viewportWidth,
    widths: new Map(columns.map((column) => [column.id, column.width])),
  };
}

export function normalizeTableScrollOffset(
  scrollOffset: number,
  maxScrollOffset: number,
  direction: "ltr" | "rtl",
) {
  return clamp(direction === "rtl" ? Math.abs(scrollOffset) : scrollOffset, 0, maxScrollOffset);
}

export function getTablePinnedShadowColumns(
  geometry: TableColumnGeometry,
  scrollOffset: number,
): TablePinnedShadowColumns {
  if (!geometry.hasHorizontalOverflow || geometry.viewportWidth <= 0) return {};

  const start = geometry.start.reduce<ResolvedTableColumnGeometry | undefined>(
    (frontier, column) => {
      const isSticky = column.start - scrollOffset <= (column.pinnedOffset ?? 0) - 1;

      return isSticky && (column.pinnedOffset ?? 0) >= (frontier?.pinnedOffset ?? -1)
        ? column
        : frontier;
    },
    undefined,
  );
  const end = geometry.end.reduce<ResolvedTableColumnGeometry | undefined>((frontier, column) => {
    const isSticky =
      column.end - scrollOffset >= geometry.viewportWidth - (column.pinnedOffset ?? 0) + 1;

    return isSticky && (column.pinnedOffset ?? 0) >= (frontier?.pinnedOffset ?? -1)
      ? column
      : frontier;
  }, undefined);

  return {end, start};
}
