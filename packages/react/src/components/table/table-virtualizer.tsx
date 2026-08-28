"use client";

import type {TableColumnDefinition} from "./table-column-geometry";
import type {ComponentPropsWithRef, ReactNode} from "react";
import type {TableLayoutProps} from "react-aria-components/Virtualizer";

import React, {useContext, useMemo} from "react";
import {TableColumnResizeStateContext} from "react-aria-components/Table";
import {TableLayout, Virtualizer} from "react-aria-components/Virtualizer";

import {TableGeometryModeContext, TableManagedColumnsContext} from "./table-context";
import {TableManagedColumns} from "./table-managed-columns";

export class TableGeometryLayout<T> extends TableLayout<T> {
  override useLayoutOptions() {
    /* React Aria invokes this as a custom hook from CollectionRoot. */

    const managedColumns = useContext(TableManagedColumnsContext);
    const resizeState = useContext(TableColumnResizeStateContext);
    const options = useMemo(
      () => ({
        columnWidths:
          resizeState?.columnWidths ??
          (managedColumns?.geometry.columns.length ? managedColumns.geometry.widths : undefined),
      }),
      [
        managedColumns?.geometry.columns.length,
        managedColumns?.geometry.widths,
        resizeState?.columnWidths,
      ],
    );

    return options;
  }
}

export interface TableVirtualizerProps extends Omit<ComponentPropsWithRef<"div">, "children"> {
  children: ReactNode;
  columns: readonly TableColumnDefinition[];
  fillContainer?: boolean;
  layoutOptions?: Omit<TableLayoutProps, "columnWidths">;
  viewportWidth?: number;
}

export const TableVirtualizer = React.forwardRef<HTMLDivElement, TableVirtualizerProps>(
  function TableVirtualizer(
    {children, columns, fillContainer, layoutOptions, viewportWidth, ...props},
    ref,
  ) {
    return (
      <TableGeometryModeContext value="virtualized">
        <TableManagedColumns
          ref={ref}
          columns={columns}
          data-slot="table-virtualizer"
          fillContainer={fillContainer}
          viewportWidth={viewportWidth}
          {...props}
        >
          <Virtualizer<TableLayoutProps>
            layout={TableGeometryLayout}
            layoutOptions={layoutOptions as TableLayoutProps}
          >
            {children}
          </Virtualizer>
        </TableManagedColumns>
      </TableGeometryModeContext>
    );
  },
);

TableVirtualizer.displayName = "SY UI.Table.Virtualizer";
