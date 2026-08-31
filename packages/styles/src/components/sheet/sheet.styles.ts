import type {VariantProps} from "tailwind-variants";
import {tv} from "tailwind-variants";

export const sheetVariants = tv({
  defaultVariants: {placement: "bottom", variant: "opaque"},
  slots: {
    backdrop: "sheet__backdrop",
    body: "sheet__body",
    closeTrigger: "sheet__close-trigger",
    content: "sheet__content",
    dialog: "sheet__dialog",
    footer: "sheet__footer",
    handle: "sheet__handle",
    header: "sheet__header",
    heading: "sheet__heading",
  },
  variants: {
    placement: {
      bottom: {content: "sheet__content--bottom", dialog: "sheet__dialog--bottom"},
      left: {content: "sheet__content--left", dialog: "sheet__dialog--left"},
      right: {content: "sheet__content--right", dialog: "sheet__dialog--right"},
      top: {content: "sheet__content--top", dialog: "sheet__dialog--top"},
    },
    variant: {
      blur: {backdrop: "sheet__backdrop--blur"},
      opaque: {backdrop: "sheet__backdrop--opaque"},
      transparent: {backdrop: "sheet__backdrop--transparent"},
    },
  },
});
export type SheetVariants = VariantProps<typeof sheetVariants>;
