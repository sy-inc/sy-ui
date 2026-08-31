import type {ComponentProps} from "react";

import {TextShimmerRoot} from "./text-shimmer";

/* -------------------------------------------------------------------------------------------------
 * Compound Component
 * -----------------------------------------------------------------------------------------------*/
export const TextShimmer = Object.assign(TextShimmerRoot, {
  Root: TextShimmerRoot,
});

export type TextShimmer = {
  Props: ComponentProps<typeof TextShimmerRoot>;
  RootProps: ComponentProps<typeof TextShimmerRoot>;
};

/* -------------------------------------------------------------------------------------------------
 * Named Component
 * -----------------------------------------------------------------------------------------------*/
export {TextShimmerRoot};

export type {TextShimmerRootProps, TextShimmerRootProps as TextShimmerProps} from "./text-shimmer";

/* -------------------------------------------------------------------------------------------------
 * Variants
 * -----------------------------------------------------------------------------------------------*/
export {textShimmerVariants} from "@sy-inc/styles";

export type {TextShimmerVariants} from "@sy-inc/styles";
