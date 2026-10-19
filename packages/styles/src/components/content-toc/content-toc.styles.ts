import type {VariantProps} from "tailwind-variants";

import {tv} from "tailwind-variants";

export const contentTocVariants = tv({
  slots: {
    base: "content-toc",
    dialog: "content-toc__dialog",
    indicator: "content-toc__indicator",
    item: "content-toc__item",
    list: "content-toc__list",
    popover: "content-toc__popover",
    rail: "content-toc__rail",
    railActive: "content-toc__rail-active",
    railBase: "content-toc__rail-base",
    railClip: "content-toc__rail-clip",
    summary: "content-toc__summary",
    summaryCount: "content-toc__summary-count",
    summaryLabel: "content-toc__summary-label",
    summaryTitle: "content-toc__summary-title",
    title: "content-toc__title",
    track: "content-toc__track",
    trail: "content-toc__trail",
    trailBar: "content-toc__trail-bar",
    trigger: "content-toc__trigger",
  },
});

export type ContentTocVariants = VariantProps<typeof contentTocVariants>;
