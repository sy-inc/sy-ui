import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const cellSwitchVariants = tv({
  defaultVariants: {
    variant: "default",
  },
  slots: {
    base: "cell-switch w-[252px]",
    badge: "cell-switch__badge rounded bg-accent px-1.5 py-0.5 text-[10px] font-medium leading-none text-accent-foreground",
    content:
      "cell-switch__trigger h-9 w-full justify-between rounded-xl bg-default px-3 shadow-field transition-colors duration-150 motion-reduce:transition-none data-[hovered=true]:bg-default/90 data-[focus-visible=true]:ring-2 data-[focus-visible=true]:ring-accent data-[focus-visible=true]:ring-offset-2 data-[focus-visible=true]:ring-offset-background",
    control: "cell-switch__control",
    copy: "cell-switch__copy flex min-w-0 flex-1 flex-col gap-0.5",
    description: "cell-switch__description text-xs font-normal leading-4 text-muted",
    label: "cell-switch__label flex min-w-0 items-center gap-1 text-sm font-medium leading-5 text-foreground",
    thumb: "cell-switch__thumb",
  },
  variants: {
    variant: {
      default: {
        base: "cell-switch--default",
      },
      feature: {
        base: "cell-switch--feature h-[72px] w-80 rounded-xl border border-border p-px",
        content: "h-[70px] rounded-[11px] bg-transparent py-2 shadow-none data-[hovered=true]:bg-default/90",
      },
      secondary: {
        base: "cell-switch--secondary [--switch-control-bg:color-mix(in_oklab,var(--muted-foreground),transparent_80%)]",
        content: "bg-secondary shadow-none data-[hovered=true]:bg-secondary/90",
      },
    },
  },
});

export type CellSwitchVariants = VariantProps<typeof cellSwitchVariants>;
