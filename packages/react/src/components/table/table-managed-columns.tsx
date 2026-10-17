"use client";

import type {TableColumnDefinition, TableColumnGeometry} from "./table-column-geometry";
import type {Key} from "@react-types/shared";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {mergeRefs} from "@react-aria/utils";
import React, {useLayoutEffect, useMemo, useRef, useState} from "react";

import {
  calculateTableColumnGeometry,
  getTablePinnedShadowColumns,
  normalizeTableScrollOffset,
} from "./table-column-geometry";
import {TableGeometryModeContext, TableManagedColumnsContext} from "./table-context";

export interface TableManagedColumnsProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  children: ReactNode;
  /** Leaf columns, in the same order as the header and every row. */
  columns: readonly TableColumnDefinition[];
  /** Distribute spare width between fixed columns. */
  fillContainer?: boolean;
  /** Controlled viewport width, primarily useful for fixed layouts and tests. */
  viewportWidth?: number;
}

const clearManagedCell = (cell: HTMLElement) => {
  delete cell.dataset["managedPinned"];
  delete cell.dataset["pinned"];
  delete cell.dataset["managedColumnIndex"];
  delete cell.dataset["pinnedShadow"];
  cell.style.removeProperty("--table-pinned-offset");
};

/**
 * Native pinning. Header cells get `data-pinned` and the offset from `Table.Column` props; body and
 * summary cells don't know their column, so they are matched by position. Shadows mark the
 * innermost pinned column on each side that is currently stuck.
 */
function useManagedPinnedCells(
  containerRef: React.RefObject<HTMLDivElement | null>,
  geometry: TableColumnGeometry,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!enabled || !container) return;

    const viewport =
      container.querySelector<HTMLElement>(
        '[data-slot="table-scroll-container"], [data-slot="table-resizable-container"]',
      ) ?? container;
    const shadows = {end: "", start: ""};

    const syncShadows = (force: boolean) => {
      const direction = getComputedStyle(viewport).direction === "rtl" ? "rtl" : "ltr";
      const scrollOffset = normalizeTableScrollOffset(
        viewport.scrollLeft,
        Math.max(0, geometry.totalWidth - geometry.viewportWidth),
        direction,
      );
      const next = getTablePinnedShadowColumns(geometry, scrollOffset);

      for (const side of ["start", "end"] as const) {
        const columnIndex = next[side] == null ? "" : String(next[side].index + 1);

        if (columnIndex === shadows[side] && !force) continue;
        shadows[side] = columnIndex;

        for (const cell of container.querySelectorAll<HTMLElement>(`[data-pinned="${side}"]`)) {
          if (cell.dataset["managedColumnIndex"] === columnIndex) cell.dataset["pinnedShadow"] = "";
          else delete cell.dataset["pinnedShadow"];
        }
      }
    };

    const syncCells = () => {
      const targets = new Set<HTMLElement>();

      for (const column of geometry.columns) {
        if (!column.pinned) continue;

        const index = column.index + 1;
        const selector = `tbody tr > *:nth-child(${index}), tfoot tr > *:nth-child(${index})`;
        const offset = `${column.pinnedOffset ?? 0}px`;

        for (const cell of container.querySelectorAll<HTMLElement>(selector)) {
          targets.add(cell);
          if (!cell.hasAttribute("data-managed-pinned")) cell.dataset["managedPinned"] = "";
          if (cell.dataset["pinned"] !== column.pinned) cell.dataset["pinned"] = column.pinned;
          if (cell.dataset["managedColumnIndex"] !== String(index)) {
            cell.dataset["managedColumnIndex"] = String(index);
          }
          if (cell.style.getPropertyValue("--table-pinned-offset") !== offset) {
            cell.style.setProperty("--table-pinned-offset", offset);
          }
        }
      }

      for (const cell of container.querySelectorAll<HTMLElement>("[data-managed-pinned]")) {
        if (!targets.has(cell)) clearManagedCell(cell);
      }

      syncShadows(true);
    };

    let frame: number | undefined;
    const scheduleShadows = () => {
      frame ??= requestAnimationFrame(() => {
        frame = undefined;
        syncShadows(false);
      });
    };

    syncCells();

    const observer = new MutationObserver(syncCells);

    observer.observe(container, {
      attributeFilter: ["data-managed-pinned", "data-pinned", "style"],
      attributes: true,
      childList: true,
      subtree: true,
    });
    viewport.addEventListener("scroll", scheduleShadows, {passive: true});

    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", scheduleShadows);
      if (frame != null) cancelAnimationFrame(frame);
      for (const cell of container.querySelectorAll<HTMLElement>("[data-managed-pinned]")) {
        clearManagedCell(cell);
      }
      // Header cells keep their React-owned `data-pinned`; only the shadow is ours.
      for (const cell of container.querySelectorAll<HTMLElement>("[data-pinned-shadow]")) {
        delete cell.dataset["pinnedShadow"];
      }
    };
  }, [containerRef, enabled, geometry]);
}

export const TableManagedColumns = React.forwardRef<HTMLDivElement, TableManagedColumnsProps>(
  function TableManagedColumns(
    {
      children,
      columns,
      fillContainer = false,
      style,
      viewportWidth: controlledViewportWidth,
      ...props
    },
    forwardedRef,
  ) {
    const geometryMode = React.useContext(TableGeometryModeContext);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const mergedContainerRef = useMemo(() => mergeRefs(containerRef, forwardedRef), [forwardedRef]);
    const [measuredViewportWidth, setMeasuredViewportWidth] = useState(0);
    const [widthOverrides, setWidthOverrides] = useState<ReadonlyMap<Key, number>>(() => new Map());

    useLayoutEffect(() => {
      if (controlledViewportWidth != null || !containerRef.current) return;

      const container = containerRef.current;
      const viewport =
        (geometryMode === "virtualized"
          ? container.querySelector<HTMLElement>('[role="grid"]')
          : container.querySelector<HTMLElement>(
              '[data-slot="table-scroll-container"], [data-slot="table-resizable-container"]',
            )) ?? container;
      const updateWidth = () => {
        const computedStyle = window.getComputedStyle(viewport);
        const horizontalPadding =
          (Number.parseFloat(computedStyle.paddingLeft) || 0) +
          (Number.parseFloat(computedStyle.paddingRight) || 0);

        setMeasuredViewportWidth(Math.max(0, viewport.clientWidth - horizontalPadding));
      };

      updateWidth();

      const observer = new ResizeObserver(updateWidth);

      observer.observe(viewport);

      return () => observer.disconnect();
    }, [controlledViewportWidth, geometryMode]);

    const viewportWidth = controlledViewportWidth ?? measuredViewportWidth;
    const geometry = useMemo(
      () => calculateTableColumnGeometry(columns, viewportWidth, widthOverrides, fillContainer),
      [columns, fillContainer, viewportWidth, widthOverrides],
    );
    const context = useMemo(
      () => ({
        definitions: new Map(columns.map((column) => [column.id, column])),
        geometry,
        setColumnWidths: setWidthOverrides,
      }),
      [columns, geometry],
    );

    useLayoutEffect(() => {
      if (
        (typeof process === "undefined" || process.env["NODE_ENV"] !== "production") &&
        viewportWidth > 0 &&
        geometryMode === "native" &&
        !geometry.hasValidPinnedWidth
      ) {
        // eslint-disable-next-line no-console
        console.warn(
          `Table pinned columns use ${geometry.pinnedStartWidth + geometry.pinnedEndWidth}px ` +
            `of a ${viewportWidth}px viewport. Unpin or resize a column to preserve scrollable content.`,
        );
      }
    }, [
      geometry.hasValidPinnedWidth,
      geometry.pinnedEndWidth,
      geometry.pinnedStartWidth,
      geometryMode,
      viewportWidth,
    ]);

    useManagedPinnedCells(containerRef, geometry, geometryMode === "native");

    return (
      <div ref={mergedContainerRef} data-slot="table-managed-columns" style={style} {...props}>
        <TableManagedColumnsContext value={context}>{children}</TableManagedColumnsContext>
      </div>
    );
  },
);

TableManagedColumns.displayName = "SY INC.Table.ManagedColumns";
