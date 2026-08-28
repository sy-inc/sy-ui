import type {ComponentProps} from "react";

import {
  TableBody,
  TableCell,
  TableCollection,
  TableColumn,
  TableColumnResizer,
  TableContent,
  TableFooter,
  TableHeader,
  TableLoadMoreContent,
  TableLoadMoreItem,
  TableLoadingOverlay,
  TableOverflow,
  TableResizableContainer,
  TableRoot,
  TableRow,
  TableScrollContainer,
  TableSelectionCheckbox,
  TableSortableColumnHeader,
  TableSummary,
} from "./table";
import {TableManagedColumns} from "./table-managed-columns";
import {TableVirtualizer} from "./table-virtualizer";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const Table = Object.assign(TableRoot, {
  Body: TableBody,
  Cell: TableCell,
  Collection: TableCollection,
  Column: TableColumn,
  ColumnResizer: TableColumnResizer,
  Content: TableContent,
  Footer: TableFooter,
  Header: TableHeader,
  LoadMore: TableLoadMoreItem,
  LoadMoreContent: TableLoadMoreContent,
  LoadingOverlay: TableLoadingOverlay,
  ManagedColumns: TableManagedColumns,
  Overflow: TableOverflow,
  ResizableContainer: TableResizableContainer,
  Root: TableRoot,
  Row: TableRow,
  ScrollContainer: TableScrollContainer,
  SelectionCheckbox: TableSelectionCheckbox,
  SortableColumnHeader: TableSortableColumnHeader,
  Summary: TableSummary,
  Virtualizer: TableVirtualizer,
});

export type Table = {
  Props: ComponentProps<typeof TableRoot>;
  RootProps: ComponentProps<typeof TableRoot>;
  ScrollContainerProps: ComponentProps<typeof TableScrollContainer>;
  ContentProps: ComponentProps<typeof TableContent>;
  HeaderProps: ComponentProps<typeof TableHeader>;
  ColumnProps: ComponentProps<typeof TableColumn>;
  ColumnResizerProps: ComponentProps<typeof TableColumnResizer>;
  BodyProps: ComponentProps<typeof TableBody>;
  RowProps: ComponentProps<typeof TableRow>;
  CellProps: ComponentProps<typeof TableCell>;
  SelectionCheckboxProps: ComponentProps<typeof TableSelectionCheckbox>;
  FooterProps: ComponentProps<typeof TableFooter>;
  LoadMoreProps: ComponentProps<typeof TableLoadMoreItem>;
  LoadMoreContentProps: ComponentProps<typeof TableLoadMoreContent>;
  LoadingOverlayProps: ComponentProps<typeof TableLoadingOverlay>;
  ManagedColumnsProps: ComponentProps<typeof TableManagedColumns>;
  OverflowProps: ComponentProps<typeof TableOverflow>;
  ResizableContainerProps: ComponentProps<typeof TableResizableContainer>;
  SortableColumnHeaderProps: ComponentProps<typeof TableSortableColumnHeader>;
  SummaryProps: ComponentProps<typeof TableSummary>;
  VirtualizerProps: ComponentProps<typeof TableVirtualizer>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {
  TableRoot,
  TableScrollContainer,
  TableContent,
  TableHeader,
  TableColumn,
  TableColumnResizer,
  TableBody,
  TableRow,
  TableCell,
  TableSelectionCheckbox,
  TableFooter,
  TableCollection,
  TableLoadMoreItem,
  TableLoadMoreContent,
  TableResizableContainer,
  TableSortableColumnHeader,
  TableManagedColumns,
  TableSummary,
  TableOverflow,
  TableLoadingOverlay,
  TableVirtualizer,
};

export type {
  TableRootProps,
  TableRootProps as TableProps,
  TableScrollContainerProps,
  TableContentProps,
  TableHeaderProps,
  TableColumnProps,
  TableColumnResizerProps,
  TableBodyProps,
  TableRowProps,
  TableCellProps,
  TableSelectionCheckboxProps,
  TableFooterProps,
  TableLoadMoreItemProps,
  TableLoadMoreContentProps,
  TableResizableContainerProps,
  TableSortableColumnHeaderProps,
  TableSortDirection,
  TableSummaryProps,
  TableOverflowProps,
  TableLoadingOverlayProps,
} from "./table";

export type {TableManagedColumnsProps} from "./table-managed-columns";
export type {TableVirtualizerProps} from "./table-virtualizer";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {tableVariants} from "@sy-inc/styles";

export type {TableVariants} from "@sy-inc/styles";

export type {TableColumnDefinition, TableColumnPinnedSide} from "./table-column-geometry";
