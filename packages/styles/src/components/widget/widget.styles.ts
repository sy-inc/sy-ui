import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

const widgetVariants = tv({
  slots: {
    base: "widget",
    content: "widget__content",
    header: "widget__header",
    legend: "widget__legend",
    legendItem: "widget__legend-item",
    title: "widget__title",
  },
});

export {widgetVariants};
export type WidgetVariants = VariantProps<typeof widgetVariants>;
