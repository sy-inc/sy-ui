import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const dropZoneVariants = tv({
  defaultVariants: {color: "default", variant: "bordered"},
  slots: {
    area: "drop-zone__area",
    base: "drop-zone",
    capsule: "drop-zone__capsule",
    clearTrigger: "drop-zone__clear-trigger",
    fileFormatIcon: "drop-zone__file-format-icon",
    fileFormatIconBadge: "drop-zone__file-format-icon-badge",
    fileHeader: "drop-zone__file-header",
    fileInfo: "drop-zone__file-info",
    fileItem: "drop-zone__file-item",
    fileMeta: "drop-zone__file-meta",
    fileName: "drop-zone__file-name",
    fileProgress: "drop-zone__file-progress",
    fileRemoveTrigger: "drop-zone__file-remove-trigger",
    fileRetryTrigger: "drop-zone__file-retry-trigger",
    previewPanel: "drop-zone__preview-panel",
    previewTrigger: "drop-zone__preview-trigger",
    row: "drop-zone__row",
    slots: "drop-zone__slots",
    trigger: "drop-zone__trigger",
  },
  variants: {
    color: {
      accent: {fileFormatIconBadge: "drop-zone__file-format-icon-badge--accent"},
      danger: {fileFormatIconBadge: "drop-zone__file-format-icon-badge--danger"},
      default: {fileFormatIconBadge: "drop-zone__file-format-icon-badge--default"},
      success: {fileFormatIconBadge: "drop-zone__file-format-icon-badge--success"},
      warning: {fileFormatIconBadge: "drop-zone__file-format-icon-badge--warning"},
    },
    variant: {
      bordered: {},
      faded: {area: "drop-zone__area--faded"},
      flat: {area: "drop-zone__area--flat"},
    },
  },
});

export type DropZoneVariants = VariantProps<typeof dropZoneVariants>;
