"use client";

import type {DOMRenderProps} from "../../utils/dom";
import type {TableVariants} from "@sy-ui/styles";
import type {CSSProperties, ComponentPropsWithRef, ReactNode} from "react";
import type {SortDescriptor} from "react-aria-components/Table";

import {mergeRefs} from "@react-aria/utils";
import {tableVariants} from "@sy-ui/styles";
import React, {
  createContext,
  use,
  useCallback,
  useId,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import {
  Cell as CellPrimitive,
  Collection as CollectionPrimitive,
  Column as ColumnPrimitive,
  ColumnResizer as ColumnResizerPrimitive,
  ResizableTableContainer as ResizableTableContainerPrimitive,
  Row as RowPrimitive,
  TableBody as TableBodyPrimitive,
  TableHeader as TableHeaderPrimitive,
  TableLoadMoreItem as TableLoadMoreItemPrimitive,
  Table as TablePrimitive,
  TableFooter as TableSummaryPrimitive,
} from "react-aria-components/Table";
import {cx} from "tailwind-variants";

import {composeSlotClassName, composeTwRenderProps} from "../../utils/compose";
import {dom} from "../../utils/dom";
import {Checkbox} from "../checkbox";
import {IconChevronDown, IconChevronUp} from "../icons";
import {Tooltip} from "../tooltip";

import {TableGeometryModeContext, TableManagedColumnsContext} from "./table-context";

/* -------------------------------------------------------------------------------------------------
 * Table Context
 * -----------------------------------------------------------------------------------------------*/
const TableContext = createContext<{
  slots?: ReturnType<typeof tableVariants>;
  isTruncate?: boolean;
  isResizable?: boolean;
}>({});

/* -------------------------------------------------------------------------------------------------
 * Table Root
 * -----------------------------------------------------------------------------------------------*/
interface TableRootProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
  /** Visual variant. */
  variant?: TableVariants["variant"];
  /** Truncate overflowing column headers. */
  isTruncate?: boolean;
  /** Automatically provides the resizable container and column resizers. */
  isResizable?: boolean;
  onResize?: ComponentPropsWithRef<typeof ResizableTableContainerPrimitive>["onResize"];
  onResizeStart?: ComponentPropsWithRef<typeof ResizableTableContainerPrimitive>["onResizeStart"];
  onResizeEnd?: ComponentPropsWithRef<typeof ResizableTableContainerPrimitive>["onResizeEnd"];
}

const TableRoot = <E extends keyof React.JSX.IntrinsicElements = "div">({
  children,
  className,
  isTruncate = false,
  isResizable = false,
  onResize,
  onResizeEnd,
  onResizeStart,
  variant,
  ...props
}: TableRootProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof TableRootProps<E>>) => {
  const slots = React.useMemo(() => tableVariants({variant}), [variant]);
  const content = isResizable ? (
    <TableResizableContainer
      onResize={onResize}
      onResizeEnd={onResizeEnd}
      onResizeStart={onResizeStart}
    >
      {children}
    </TableResizableContainer>
  ) : (
    children
  );

  return (
    <TableContext value={{isTruncate, isResizable, slots}}>
      <dom.div
        className={slots.base({className})}
        data-resizable={isResizable || undefined}
        data-slot="table"
        {...(props as any)}
      >
        {content}
      </dom.div>
    </TableContext>
  );
};

TableRoot.displayName = "SY UI.Table";

/* -------------------------------------------------------------------------------------------------
 * Table Scroll Container
 * -----------------------------------------------------------------------------------------------*/
interface TableScrollContainerProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const TableScrollContainer = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: TableScrollContainerProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof TableScrollContainerProps<E>>) => {
  const {slots} = use(TableContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.scrollContainer, className)}
      data-slot="table-scroll-container"
      {...(props as any)}
    />
  );
};

TableScrollContainer.displayName = "SY UI.Table.ScrollContainer";

/* -------------------------------------------------------------------------------------------------
 * Table Content
 * -----------------------------------------------------------------------------------------------*/
interface TableContentProps extends Omit<
  ComponentPropsWithRef<typeof TablePrimitive>,
  "className" | "onSortChange"
> {
  className?: string;
  onSortChange?: (descriptor: SortDescriptor | undefined) => void;
}

function TableContent({className, onSortChange, sortDescriptor, style, ...props}: TableContentProps) {
  const {slots} = use(TableContext);
  const managedColumns = use(TableManagedColumnsContext);
  const handleSortChange = useCallback(
    (nextDescriptor: SortDescriptor) => {
      onSortChange?.(
        sortDescriptor?.column === nextDescriptor.column &&
          sortDescriptor.direction === "descending" &&
          nextDescriptor.direction === "ascending"
          ? undefined
          : nextDescriptor,
      );
    },
    [onSortChange, sortDescriptor],
  );
  const managedStyle = managedColumns
    ? {
        minWidth: managedColumns.geometry.totalWidth,
        width: managedColumns.geometry.totalWidth,
      }
    : undefined;

  return (
    <TablePrimitive
      className={composeTwRenderProps(className, slots?.content())}
      data-managed-layout={managedColumns ? "true" : undefined}
      data-slot="table-content"
      style={
        typeof style === "function"
          ? (values) => ({...managedStyle, ...style(values)})
          : {...managedStyle, ...style}
      }
      {...props}
      sortDescriptor={sortDescriptor}
      onSortChange={handleSortChange}
    />
  );
}

(TableContent as React.FC).displayName = "SY UI.Table.Content";

/* -------------------------------------------------------------------------------------------------
 * Table Header
 * -----------------------------------------------------------------------------------------------*/
interface TableHeaderProps<T extends object> extends ComponentPropsWithRef<
  typeof TableHeaderPrimitive<T>
> {}

function TableHeader<T extends object>({className, ...props}: TableHeaderProps<T>) {
  const {slots} = use(TableContext);

  return (
    <TableHeaderPrimitive
      className={composeTwRenderProps(className, slots?.header())}
      data-slot="table-header"
      {...props}
    />
  );
}

(TableHeader as React.FC).displayName = "SY UI.Table.Header";

/* -------------------------------------------------------------------------------------------------
 * Table Column
 * -----------------------------------------------------------------------------------------------*/
interface TableColumnProps extends ComponentPropsWithRef<typeof ColumnPrimitive> {
  tooltipProps?: Omit<React.ComponentProps<typeof Tooltip>, "children" | "isDisabled">;
}

const TableColumn = ({
  className,
  children,
  defaultWidth,
  id,
  maxWidth,
  minWidth,
  ref,
  style,
  width,
  tooltipProps,
  ...props
}: TableColumnProps) => {
  const {isResizable, isTruncate, slots} = use(TableContext);
  const managedColumns = use(TableManagedColumnsContext);
  const geometryMode = use(TableGeometryModeContext);
  const column = id == null ? undefined : managedColumns?.geometry.byId.get(id);
  const definition = id == null ? undefined : managedColumns?.definitions.get(id);
  const pinned = geometryMode === "native" ? column?.pinned : undefined;
  const managedStyle: CSSProperties | undefined = column
    ? {
        ...(pinned
          ? ({"--table-pinned-offset": `${column.pinnedOffset ?? 0}px`} as CSSProperties)
          : {}),
        width: column.width,
      }
    : undefined;
  const isSelectionCheckbox =
    React.isValidElement(children) && children.type === TableSelectionCheckbox;
  const resolvedChildren =
    (isTruncate && !isSelectionCheckbox) || isResizable ? (
      typeof children === "function" ? (
        (values: unknown) => (
          <>
            {isTruncate && !isSelectionCheckbox ? (
              <TableOverflow
                tooltip
                tooltipProps={tooltipProps}
                className="block max-w-full min-w-0 truncate"
              >
                {(children as (values: unknown) => ReactNode)(values)}
              </TableOverflow>
            ) : (
              (children as (values: unknown) => ReactNode)(values)
            )}
            {isResizable ? <TableColumnResizer /> : null}
          </>
        )
      ) : (
        <>
          {isTruncate && !isSelectionCheckbox ? (
            <TableOverflow
              tooltip
              tooltipProps={tooltipProps}
              className="block max-w-full min-w-0 truncate"
            >
              {children}
            </TableOverflow>
          ) : (
            children
          )}
          {isResizable ? <TableColumnResizer /> : null}
        </>
      )
    ) : (
      children
    );

  return (
    <ColumnPrimitive
      ref={ref}
      className={composeTwRenderProps(className, slots?.column())}
      data-managed-column-index={column ? column.index + 1 : undefined}
      data-pinned={pinned}
      data-slot="table-column"
      defaultWidth={column ? undefined : defaultWidth}
      id={id}
      maxWidth={definition?.maxWidth ?? maxWidth}
      minWidth={definition?.minWidth ?? minWidth}
      width={column?.width ?? width}
      style={
        typeof style === "function"
          ? (values) => ({...managedStyle, ...style(values)})
          : {...managedStyle, ...style}
      }
      {...props}
    >
      {resolvedChildren}
    </ColumnPrimitive>
  );
};

TableColumn.displayName = "SY UI.Table.Column";

/* -------------------------------------------------------------------------------------------------
 * Table Body
 * -----------------------------------------------------------------------------------------------*/
interface TableBodyProps<T extends object> extends ComponentPropsWithRef<
  typeof TableBodyPrimitive<T>
> {}

function TableBody<T extends object>({className, ...props}: TableBodyProps<T>) {
  const {slots} = use(TableContext);

  return (
    <TableBodyPrimitive
      className={composeTwRenderProps(className, slots?.body())}
      data-slot="table-body"
      {...props}
    />
  );
}

(TableBody as React.FC).displayName = "SY UI.Table.Body";

/* -------------------------------------------------------------------------------------------------
 * Table Summary (native table footer row group)
 * -----------------------------------------------------------------------------------------------*/
interface TableSummaryProps<T extends object> extends ComponentPropsWithRef<
  typeof TableSummaryPrimitive<T>
> {
  /** Keep the summary visible at the bottom of the nearest scrolling table viewport. */
  isSticky?: boolean;
}

function TableSummary<T extends object>({
  className,
  isSticky = true,
  onClickCapture,
  onPointerDownCapture,
  ...props
}: TableSummaryProps<T>) {
  const {slots} = use(TableContext);

  return (
    <TableSummaryPrimitive
      className={composeSlotClassName(slots?.summary, className)}
      data-slot="table-summary"
      data-sticky={isSticky || undefined}
      onClickCapture={(event) => {
        event.stopPropagation();
        onClickCapture?.(event);
      }}
      onPointerDownCapture={(event) => {
        event.stopPropagation();
        onPointerDownCapture?.(event);
      }}
      {...props}
    />
  );
}

(TableSummary as React.FC).displayName = "SY UI.Table.Summary";

/* -------------------------------------------------------------------------------------------------
 * Table Row
 * -----------------------------------------------------------------------------------------------*/
interface TableRowProps<T extends object> extends ComponentPropsWithRef<typeof RowPrimitive<T>> {}

function TableRow<T extends object>({className, ...props}: TableRowProps<T>) {
  const {slots} = use(TableContext);

  return (
    <RowPrimitive
      className={composeTwRenderProps(className, slots?.row())}
      data-slot="table-row"
      {...props}
    />
  );
}

(TableRow as React.FC).displayName = "SY UI.Table.Row";

/* -------------------------------------------------------------------------------------------------
 * Table Cell
 * -----------------------------------------------------------------------------------------------*/
type TableCellProps = ComponentPropsWithRef<typeof CellPrimitive>;

const TableCell = ({className, ref, ...props}: TableCellProps) => {
  const {isTruncate, slots} = use(TableContext);
  const children =
    isTruncate ? (
      typeof props.children === "function" ? (
        (values: unknown) => (
          <div className="max-w-full min-w-0 truncate" data-slot="table-cell-content">
            {(props.children as (values: unknown) => ReactNode)(values)}
          </div>
        )
      ) : (
        <div className="max-w-full min-w-0 truncate" data-slot="table-cell-content">
          {props.children}
        </div>
      )
    ) : (
      props.children
    );

  return (
    <CellPrimitive
      ref={ref}
      className={composeTwRenderProps(className, slots?.cell())}
      data-slot="table-cell"
      {...props}
    >
      {children}
    </CellPrimitive>
  );
};

TableCell.displayName = "SY UI.Table.Cell";

/* -------------------------------------------------------------------------------------------------
 * Table Selection Checkbox
 * -----------------------------------------------------------------------------------------------*/
interface TableSelectionCheckboxProps extends Omit<
  ComponentPropsWithRef<typeof Checkbox>,
  "children" | "slot"
> {}

const TableSelectionCheckbox = ({className, ref, ...props}: TableSelectionCheckboxProps) => (
  <Checkbox
    ref={ref}
    className={className}
    data-slot="table-selection-checkbox"
    slot="selection"
    {...props}
  >
    <Checkbox.Content>
      <Checkbox.Control>
        <Checkbox.Indicator />
      </Checkbox.Control>
    </Checkbox.Content>
  </Checkbox>
);

TableSelectionCheckbox.displayName = "SY UI.Table.SelectionCheckbox";

/* -------------------------------------------------------------------------------------------------
 * Table Overflow
 * -----------------------------------------------------------------------------------------------*/
interface TableOverflowProps extends ComponentPropsWithRef<"span"> {
  /** Show the full content in a tooltip, but only when it is actually clipped. */
  tooltip?: boolean;
  tooltipProps?: Omit<React.ComponentProps<typeof Tooltip>, "children" | "isDisabled">;
}

const TableOverflowTooltipContent = Tooltip.Content as React.ComponentType<
  React.ComponentProps<typeof Tooltip.Content> & {id?: string}
>;

const TableOverflow = ({
  children,
  className,
  ref,
  tooltip = false,
  tooltipProps,
  ...props
}: TableOverflowProps) => {
  const {slots} = use(TableContext);
  const localRef = useRef<HTMLSpanElement | null>(null);
  const mergedRef = React.useMemo(() => mergeRefs(localRef, ref), [ref]);
  const [isOverflowed, setIsOverflowed] = useState(false);
  const [isTooltipOpen, setIsTooltipOpen] = useState(false);
  const tooltipId = useId();
  const updateOverflow = useCallback(() => {
    const element = localRef.current;

    if (element) setIsOverflowed(element.scrollWidth > element.clientWidth);
  }, []);

  useLayoutEffect(() => {
    const element = localRef.current;

    if (!element) return;

    updateOverflow();

    const observer = new ResizeObserver(updateOverflow);

    observer.observe(element);

    return () => observer.disconnect();
  }, [updateOverflow]);

  useLayoutEffect(updateOverflow, [children, updateOverflow]);

  useLayoutEffect(() => {
    const element = localRef.current;
    const owner = element?.closest<HTMLElement>(
      '[data-slot="table-column"], [data-slot="table-cell"]',
    );

    if (!tooltip || !isOverflowed || !owner) return;

    const descriptions = new Set(
      owner.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean),
    );

    descriptions.add(tooltipId);
    owner.setAttribute("aria-describedby", [...descriptions].join(" "));

    const open = () => setIsTooltipOpen(true);
    const close = () => setIsTooltipOpen(false);

    owner.addEventListener("focus", open);
    owner.addEventListener("blur", close);

    return () => {
      owner.removeEventListener("focus", open);
      owner.removeEventListener("blur", close);
      const remainingDescriptions = new Set(
        owner.getAttribute("aria-describedby")?.split(/\s+/).filter(Boolean),
      );

      remainingDescriptions.delete(tooltipId);
      if (remainingDescriptions.size > 0) {
        owner.setAttribute("aria-describedby", [...remainingDescriptions].join(" "));
      } else {
        owner.removeAttribute("aria-describedby");
      }
    };
  }, [isOverflowed, tooltip, tooltipId]);

  if (!tooltip) {
    return (
      <span
        ref={mergedRef}
        className={composeSlotClassName(slots?.overflow, className)}
        data-overflowed={isOverflowed || undefined}
        data-slot="table-overflow"
        {...props}
      >
        {children}
      </span>
    );
  }

  return (
    <Tooltip
      {...tooltipProps}
      isDisabled={!isOverflowed}
      isOpen={tooltipProps?.isOpen ?? (isOverflowed ? isTooltipOpen : false)}
      onOpenChange={(open) => {
        setIsTooltipOpen(open);
        tooltipProps?.onOpenChange?.(open);
      }}
    >
      <Tooltip.Trigger<"span">
        {...props}
        render={(triggerProps) => {
          const {
            children: _triggerChildren,
            className: _triggerClassName,
            role: _triggerRole,
            tabIndex: _triggerTabIndex,
            ...safeTriggerProps
          } = triggerProps;

          return (
            <span
              {...safeTriggerProps}
              ref={mergeRefs(safeTriggerProps.ref, mergedRef)}
              className={composeSlotClassName(slots?.overflow, className)}
              data-overflowed={isOverflowed || undefined}
              data-slot="table-overflow"
              onMouseEnter={(event) => {
                safeTriggerProps.onMouseEnter?.(event);
                setIsTooltipOpen(true);
              }}
              onMouseLeave={(event) => {
                safeTriggerProps.onMouseLeave?.(event);
                setIsTooltipOpen(false);
              }}
            >
              {children}
            </span>
          );
        }}
      />
      <TableOverflowTooltipContent id={tooltipId}>{children}</TableOverflowTooltipContent>
    </Tooltip>
  );
};

TableOverflow.displayName = "SY UI.Table.Overflow";

/* -------------------------------------------------------------------------------------------------
 * Table Footer
 * -----------------------------------------------------------------------------------------------*/
interface TableFooterProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const TableFooter = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: TableFooterProps<E> & Omit<React.JSX.IntrinsicElements[E], keyof TableFooterProps<E>>) => {
  const {slots} = use(TableContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.footer, className)}
      data-slot="table-footer"
      {...(props as any)}
    />
  );
};

TableFooter.displayName = "SY UI.Table.Footer";

/* -------------------------------------------------------------------------------------------------
 * Table Resizable Container
 * -----------------------------------------------------------------------------------------------*/
interface TableResizableContainerProps extends ComponentPropsWithRef<
  typeof ResizableTableContainerPrimitive
> {}

const TableResizableContainer = ({
  className,
  onResize,
  ref,
  ...props
}: TableResizableContainerProps) => {
  const managedColumns = use(TableManagedColumnsContext);

  return (
    <ResizableTableContainerPrimitive
      ref={ref}
      className={cx("table__resizable-container", className)}
      data-slot="table-resizable-container"
      onResize={(widths) => {
        if (managedColumns) {
          managedColumns.setColumnWidths(
            new Map(
              [...widths].flatMap(([key, width]) =>
                typeof width === "number" ? [[key, width] as const] : [],
              ),
            ),
          );
        }

        onResize?.(widths);
      }}
      {...props}
    />
  );
};

TableResizableContainer.displayName = "SY UI.Table.ResizableContainer";

/* -------------------------------------------------------------------------------------------------
 * Table Column Resizer
 * -----------------------------------------------------------------------------------------------*/
interface TableColumnResizerProps extends ComponentPropsWithRef<typeof ColumnResizerPrimitive> {}

const TableColumnResizer = ({className, ref, ...props}: TableColumnResizerProps) => {
  const {slots} = use(TableContext);

  return (
    <ColumnResizerPrimitive
      ref={ref}
      className={composeTwRenderProps(className, slots?.columnResizer())}
      data-slot="table-column-resizer"
      {...props}
    />
  );
};

TableColumnResizer.displayName = "SY UI.Table.ColumnResizer";

/* -------------------------------------------------------------------------------------------------
 * Table Load More Item
 * -----------------------------------------------------------------------------------------------*/
interface TableLoadMoreItemProps extends ComponentPropsWithRef<typeof TableLoadMoreItemPrimitive> {}

const TableLoadMoreItem = ({className, ref, ...props}: TableLoadMoreItemProps) => {
  const {slots} = use(TableContext);

  return (
    <TableLoadMoreItemPrimitive
      ref={ref}
      className={composeSlotClassName(slots?.loadMore, className)}
      data-slot="table-load-more"
      {...props}
    />
  );
};

TableLoadMoreItem.displayName = "SY UI.Table.LoadMore";

/* -------------------------------------------------------------------------------------------------
 * Table Load More Content
 * -----------------------------------------------------------------------------------------------*/
interface TableLoadMoreContentProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const TableLoadMoreContent = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: TableLoadMoreContentProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof TableLoadMoreContentProps<E>>) => {
  const {slots} = use(TableContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.loadMoreContent, className)}
      data-slot="table-load-more-content"
      {...(props as any)}
    />
  );
};

TableLoadMoreContent.displayName = "SY UI.Table.LoadMoreContent";

/* -------------------------------------------------------------------------------------------------
 * Table Loading Overlay
 * -----------------------------------------------------------------------------------------------*/
interface TableLoadingOverlayProps<
  E extends keyof React.JSX.IntrinsicElements = "div",
> extends DOMRenderProps<E, undefined> {
  children?: ReactNode;
  className?: string;
}

const TableLoadingOverlay = <E extends keyof React.JSX.IntrinsicElements = "div">({
  className,
  ...props
}: TableLoadingOverlayProps<E> &
  Omit<React.JSX.IntrinsicElements[E], keyof TableLoadingOverlayProps<E>>) => {
  const {slots} = use(TableContext);

  return (
    <dom.div
      className={composeSlotClassName(slots?.loadingOverlay, className)}
      data-slot="table-loading-overlay"
      {...(props as any)}
    />
  );
};

TableLoadingOverlay.displayName = "SY UI.Table.LoadingOverlay";

/* -------------------------------------------------------------------------------------------------
 * Table Sortable Column Header
 * -----------------------------------------------------------------------------------------------*/
type TableSortDirection = "ascending" | "descending";

interface TableSortableColumnHeaderProps extends Omit<
  React.ComponentPropsWithRef<"span">,
  "children"
> {
  /** Label content of the column header. */
  children?: ReactNode;
  /**
   * Current sort direction for the column. Pass the `sortDirection` value
   * received from `Table.Column`'s render-prop callback.
   */
  sortDirection?: TableSortDirection;
  /**
   * Custom indicator element. When provided, overrides the default chevron.
   * The indicator receives a `data-direction` attribute reflecting the
   * current sort direction. Pass `null` to render no indicator.
   */
  indicator?: ReactNode;
}

const TableSortableColumnHeader = ({
  children,
  className,
  indicator,
  ref,
  sortDirection,
  ...props
}: TableSortableColumnHeaderProps) => {
  const {slots} = use(TableContext);

  let indicatorElement: ReactNode = null;

  if (indicator === undefined) {
    indicatorElement = (
      <span
        className={slots?.sortableColumnIndicator()}
        data-direction={sortDirection}
        data-slot="table-sortable-column-indicator"
      >
        <IconChevronUp aria-hidden="true" data-sort-icon="neutral-ascending" />
        <IconChevronDown aria-hidden="true" data-sort-icon="neutral-descending" />
        <IconChevronUp aria-hidden="true" data-sort-icon="active" />
      </span>
    );
  } else if (React.isValidElement(indicator)) {
    const element = indicator as React.ReactElement<{
      className?: string;
      "data-direction"?: TableSortDirection;
      "data-slot"?: "table-sortable-column-indicator";
    }>;

    indicatorElement = React.cloneElement(element, {
      className: composeSlotClassName(slots?.sortableColumnIndicator, element.props.className),
      "data-direction": sortDirection,
      "data-slot": "table-sortable-column-indicator",
    });
  } else {
    indicatorElement = indicator;
  }

  return (
    <span
      ref={ref}
      className={composeSlotClassName(slots?.sortableColumnHeader, className)}
      data-direction={sortDirection}
      data-slot="table-sortable-column-header"
      {...props}
    >
      {children}
      {indicatorElement}
    </span>
  );
};

TableSortableColumnHeader.displayName = "SY UI.Table.SortableColumnHeader";

/* -------------------------------------------------------------------------------------------------
 * Exports
 * -----------------------------------------------------------------------------------------------*/
// Re-export Collection from React Aria for dynamic cell rendering within rows.
// Users wrap their dynamic cells in <Table.Collection items={columns}> when they
// need to render additional static cells (e.g. checkbox, drag handle) alongside
// dynamic column-based cells.
const TableCollection = CollectionPrimitive;

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
  TableSummary,
  TableOverflow,
  TableLoadingOverlay,
};

export type {
  TableRootProps,
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
};
