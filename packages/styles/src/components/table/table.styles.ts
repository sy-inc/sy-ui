import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const tableVariants = tv({
  defaultVariants: {
    variant: "primary",
  },
  slots: {
    base: "table-root",
    body: "table__body",
    cell: "table__cell",
    column: "table__column",
    columnResizer: "table__column-resizer",
    content: "table__content",
    dragHandle: "table__drag-handle",
    footer: "table__footer",
    header: "table__header",
    loadMore: "table__load-more",
    loadMoreContent: "table__load-more-content",
    loadingOverlay: "table__loading-overlay",
    overflow: "table__overflow",
    resizableContainer: "table__resizable-container",
    row: "table__row",
    scrollContainer: "table__scroll-container",
    sortableColumnHeader: "table__sortable-column-header",
    sortableColumnIndicator: "table__sortable-column-indicator",
    summary: "table__summary",
  },
  variants: {
    variant: {
      primary: {
        base: "table-root--primary",
      },
      secondary: {
        base: "table-root--secondary",
      },
    },
  },
});

export type TableVariants = VariantProps<typeof tableVariants>;
