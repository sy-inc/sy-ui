"use client";

import type {TableColumnDefinition, TableColumnGeometry} from "./table-column-geometry";
import type {Key} from "@react-types/shared";
import type {ComponentPropsWithRef, ReactNode} from "react";

import {mergeRefs} from "@react-aria/utils";
import React, {useCallback, useLayoutEffect, useMemo, useRef, useState} from "react";

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

function usePinnedShadowSync(
  containerRef: React.RefObject<HTMLDivElement | null>,
  geometry: TableColumnGeometry,
  enabled: boolean,
) {
  const geometryRef = useRef(geometry);

  const viewportRef = useRef<HTMLElement | null>(null);
  const shadowStateRef = useRef({end: "", start: ""});
  const updateShadows = useCallback(
    (force = false) => {
      const container = containerRef.current;
      const viewport = viewportRef.current;

      if (!enabled || !container || !viewport) return;

      const currentGeometry = geometryRef.current;
      const direction = getComputedStyle(viewport).direction === "rtl" ? "rtl" : "ltr";
      const scrollOffset = normalizeTableScrollOffset(
        viewport.scrollLeft,
        Math.max(0, currentGeometry.totalWidth - currentGeometry.viewportWidth),
        direction,
      );
      const shadows = getTablePinnedShadowColumns(currentGeometry, scrollOffset);
      const nextEnd = shadows.end == null ? "" : String(shadows.end.index + 1);
      const nextStart = shadows.start == null ? "" : String(shadows.start.index + 1);
      const state = shadowStateRef.current;

      const syncShadowCells = (side: "end" | "start", columnIndex: string) => {
        for (const cell of container.querySelectorAll<HTMLElement>(`[data-pinned="${side}"]`)) {
          if (cell.dataset["managedColumnIndex"] === columnIndex) cell.dataset["pinnedShadow"] = "";
          else delete cell.dataset["pinnedShadow"];
        }
      };

      if (nextStart !== state.start || force) {
        state.start = nextStart;
        if (nextStart) container.dataset["tableStartShadow"] = nextStart;
        else delete container.dataset["tableStartShadow"];
        syncShadowCells("start", nextStart);
      }

      if (nextEnd !== state.end || force) {
        state.end = nextEnd;
        if (nextEnd) container.dataset["tableEndShadow"] = nextEnd;
        else delete container.dataset["tableEndShadow"];
        syncShadowCells("end", nextEnd);
      }
    },
    [containerRef, enabled],
  );

  useLayoutEffect(() => {
    geometryRef.current = geometry;
  }, [geometry]);

  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!enabled || !container) return;

    const viewport =
      container.querySelector<HTMLElement>(
        '[data-slot="table-scroll-container"], [data-slot="table-resizable-container"]',
      ) ?? container;

    viewportRef.current = viewport;

    let frame: number | undefined;
    const scheduleUpdate = () => {
      if (frame == null) {
        frame = requestAnimationFrame(() => {
          frame = undefined;
          updateShadows();
        });
      }
    };

    updateShadows();
    viewport.addEventListener("scroll", scheduleUpdate, {passive: true});
    const observer = new MutationObserver(() => updateShadows(true));

    observer.observe(container, {
      attributeFilter: ["data-managed-column-index", "data-pinned"],
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      viewport.removeEventListener("scroll", scheduleUpdate);
      if (frame != null) cancelAnimationFrame(frame);
      viewportRef.current = null;
      shadowStateRef.current = {end: "", start: ""};
      delete container.dataset["tableEndShadow"];
      delete container.dataset["tableStartShadow"];
      for (const cell of container.querySelectorAll<HTMLElement>("[data-pinned-shadow]")) {
        delete cell.dataset["pinnedShadow"];
      }
    };
  }, [containerRef, enabled, updateShadows]);

  useLayoutEffect(() => updateShadows(), [geometry, updateShadows]);
}

function useManagedPinnedCells(
  containerRef: React.RefObject<HTMLDivElement | null>,
  geometry: TableColumnGeometry,
  enabled: boolean,
) {
  useLayoutEffect(() => {
    const container = containerRef.current;

    if (!enabled || !container) return;

    const sync = () => {
      const targets = new Set<HTMLElement>();

      for (const column of geometry.columns) {
        if (!column.pinned) continue;

        const index = column.index + 1;
        const selector = [
          `thead tr > *:nth-child(${index})`,
          `tbody tr > *:nth-child(${index})`,
          `tfoot tr > *:nth-child(${index})`,
        ].join(",");
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
        if (targets.has(cell)) continue;
        delete cell.dataset["managedPinned"];
        delete cell.dataset["pinned"];
        delete cell.dataset["managedColumnIndex"];
        delete cell.dataset["pinnedShadow"];
        cell.style.removeProperty("--table-pinned-offset");
      }
    };

    sync();

    const observer = new MutationObserver(sync);

    observer.observe(container, {
      attributeFilter: ["data-managed-pinned", "data-pinned", "style"],
      attributes: true,
      childList: true,
      subtree: true,
    });

    return () => {
      observer.disconnect();
      for (const cell of container.querySelectorAll<HTMLElement>("[data-managed-pinned]")) {
        delete cell.dataset["managedPinned"];
        delete cell.dataset["pinned"];
        delete cell.dataset["managedColumnIndex"];
        delete cell.dataset["pinnedShadow"];
        cell.style.removeProperty("--table-pinned-offset");
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
    usePinnedShadowSync(containerRef, geometry, geometryMode === "native");

    return (
      <div
        ref={mergedContainerRef}
        data-slot="table-managed-columns"
        data-table-geometry=""
        style={style}
        {...props}
      >
        <TableManagedColumnsContext value={context}>{children}</TableManagedColumnsContext>
      </div>
    );
  },
);

TableManagedColumns.displayName = "SY INC.Table.ManagedColumns";
